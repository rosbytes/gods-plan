import { TRPCError } from "@trpc/server"
import { razorpay } from "../../configs"
import {
    db,
    marketSubcriptionCharges,
    mandiSubcriptionCharges,
    marketVendor,
    mandiVendor,
    eq,
    and,
    or,
} from "@ros/db"
import crypto from "crypto"
import type { AdminContext } from "../../middlewares"

const MANDI_REGISTRATION_AMOUNT_PAISE = 10000 * 100 // ₹10,000 in paise (1,000,000)
const MARKET_REGISTRATION_AMOUNT_PAISE = 5000 * 100 // ₹5,000 in paise (500,000)

// ─── Create Razorpay Order ────────────────────────────────────────────────────
export const createOrder = async ({
    input,
    ctx,
}: {
    input: { storeId: string; vendorId: string; vendorType: "market_vendor" | "mandi_vendor" }
    ctx: AdminContext
}) => {
    try {
        console.log("[createOrder] Input received:", input)

        // 1. Fetch Vendor Data & Determine Table
        let vendorData: any
        let isMandi = input.vendorType === "mandi_vendor"
        const amountPaise = isMandi
            ? MANDI_REGISTRATION_AMOUNT_PAISE
            : MARKET_REGISTRATION_AMOUNT_PAISE

        if (isMandi) {
            const [mandi] = await db
                .select()
                .from(mandiVendor)
                .where(eq(mandiVendor.id, input.vendorId))
                .limit(1)
            vendorData = mandi
        } else {
            const [market] = await db
                .select()
                .from(marketVendor)
                .where(eq(marketVendor.id, input.vendorId))
                .limit(1)
            vendorData = market
        }

        // 2. Create Razorpay order (Razorpay requires amount in paise)
        console.log("[createOrder] Creating razorpay order...")
        const order = await razorpay.orders.create({
            amount: amountPaise,
            currency: "INR",
            receipt: `reg_${input.storeId.substring(0, 8)}`,
            notes: {
                storeId: input.storeId,
                vendorId: input.vendorId,
                vendorType: isMandi ? "mandi_vendor" : "market_vendor",
                type: "store_registration",
            },
        })
        console.log("[createOrder] Razorpay order created:", order.id)

        console.log("[createOrder] Creating or updating pending record in DB...")
        // 3. Create or update pending record in appropriate DB table (stored in paise)
        if (isMandi) {
            const [existingPending] = await db
                .select()
                .from(mandiSubcriptionCharges)
                .where(
                    and(
                        eq(mandiSubcriptionCharges.vendorId, input.vendorId),
                        eq(mandiSubcriptionCharges.paymentStatus, "pending"),
                    ),
                )
                .limit(1)

            if (existingPending) {
                await db
                    .update(mandiSubcriptionCharges)
                    .set({
                        amount: amountPaise,
                        transactionId: order.id,
                        paymentDate: new Date(),
                        paymentCollectedBy: ctx.admin.id,
                    })
                    .where(eq(mandiSubcriptionCharges.id, existingPending.id))
            } else {
                await db.insert(mandiSubcriptionCharges).values({
                    vendorId: input.vendorId,
                    amount: amountPaise,
                    transactionId: order.id,
                    paymentDate: new Date(),
                    paymentStatus: "pending",
                    paymentMethod: "upi",
                    paymentCollectedBy: ctx.admin.id,
                })
            }
        } else {
            const [existingPending] = await db
                .select()
                .from(marketSubcriptionCharges)
                .where(
                    and(
                        eq(marketSubcriptionCharges.vendorId, input.vendorId),
                        eq(marketSubcriptionCharges.paymentStatus, "pending"),
                    ),
                )
                .limit(1)

            if (existingPending) {
                await db
                    .update(marketSubcriptionCharges)
                    .set({
                        amount: amountPaise,
                        transactionId: order.id,
                        paymentDate: new Date(),
                        paymentCollectedBy: ctx.admin.id,
                    })
                    .where(eq(marketSubcriptionCharges.id, existingPending.id))
            } else {
                await db.insert(marketSubcriptionCharges).values({
                    vendorId: input.vendorId,
                    amount: amountPaise,
                    transactionId: order.id,
                    paymentDate: new Date(),
                    paymentStatus: "pending",
                    paymentMethod: "upi",
                    paymentCollectedBy: ctx.admin.id,
                })
            }
        }
        console.log("[createOrder] DB record inserted/updated!")

        return {
            orderId: order.id,
            amount: amountPaise, // sent to frontend in PAISE
            currency: "INR",
            keyId: process.env["RAZORPAY_KEY_ID"]!,
            vendorContact: vendorData?.primaryPhone || "",
            vendorName: vendorData?.fullName || "",
        }
    } catch (error: any) {
        console.error("[createOrder] error:", error?.error || error?.response?.data || error)
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error?.message || "Failed to create payment order",
            cause: error,
        })
    }
}

// ─── Get Payment Status ───────────────────────────────────────────────────────
export const getPaymentStatus = async ({
    input,
}: {
    input: { orderId: string; paymentId?: string }
    ctx: AdminContext
}) => {
    try {
        // Build search conditions — verifyPayment may have overwritten transactionId
        // from order_xxx to pay_xxx, so search for either
        const marketConditions = input.paymentId
            ? or(
                  eq(marketSubcriptionCharges.transactionId, input.orderId),
                  eq(marketSubcriptionCharges.transactionId, input.paymentId),
              )
            : eq(marketSubcriptionCharges.transactionId, input.orderId)

        const mandiConditions = input.paymentId
            ? or(
                  eq(mandiSubcriptionCharges.transactionId, input.orderId),
                  eq(mandiSubcriptionCharges.transactionId, input.paymentId),
              )
            : eq(mandiSubcriptionCharges.transactionId, input.orderId)

        // Check DB first — webhook or verifyPayment may have updated transactionId
        let [record] = await db
            .select()
            .from(marketSubcriptionCharges)
            .where(marketConditions)
            .limit(1)

        if (!record) {
            ;[record] = await db
                .select()
                .from(mandiSubcriptionCharges)
                .where(mandiConditions)
                .limit(1)
        }

        if (!record) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" })
        }

        // If already resolved, return the DB status with amount in PAISE
        if (record.paymentStatus === "success" || record.paymentStatus === "failed") {
            return {
                status: record.paymentStatus,
                paymentId: record.transactionId,
                method: record.paymentMethod,
                amount: record.amount, // in PAISE
                paidAt: record.paymentDate,
            }
        }

        // Otherwise poll Razorpay directly
        const payments = await razorpay.orders.fetchPayments(input.orderId)
        const paid = (
            payments.items as Array<{ status: string; id: string; method: string }>
        )?.find((p) => p.status === "captured" || p.status === "authorized")

        if (paid) {
            // Sync to DB
            const updatedMarket = await db
                .update(marketSubcriptionCharges)
                .set({ paymentStatus: "success", transactionId: paid.id, paymentDate: new Date() })
                .where(eq(marketSubcriptionCharges.transactionId, input.orderId))
                .returning()

            if (!updatedMarket.length) {
                await db
                    .update(mandiSubcriptionCharges)
                    .set({
                        paymentStatus: "success",
                        transactionId: paid.id,
                        paymentDate: new Date(),
                    })
                    .where(eq(mandiSubcriptionCharges.transactionId, input.orderId))
            }

            return {
                status: "success" as const,
                paymentId: paid.id,
                method: paid.method ?? "upi",
                amount: record.amount, // in PAISE
                paidAt: new Date(),
            }
        }

        return {
            status: "pending" as const,
            paymentId: null,
            method: null,
            amount: record.amount, // in PAISE
            paidAt: null,
        }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch payment status",
            cause: error,
        })
    }
}

// ─── Verify Payment Signature & Persist ──────────────────────────────────────
export const verifyPayment = async ({
    input,
}: {
    input: {
        razorpayOrderId: string
        razorpayPaymentId: string
        razorpaySignature: string
        storeId: string
        vendorId: string
    }
    ctx: AdminContext
}) => {
    const secret = process.env["RAZORPAY_KEY_SECRET"]!
    const body = `${input.razorpayOrderId}|${input.razorpayPaymentId}`
    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex")

    if (expectedSignature !== input.razorpaySignature) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid payment signature" })
    }

    const updatedMarket = await db
        .update(marketSubcriptionCharges)
        .set({
            paymentStatus: "success",
            transactionId: input.razorpayPaymentId,
            paymentDate: new Date(),
        })
        .where(eq(marketSubcriptionCharges.transactionId, input.razorpayOrderId))
        .returning()

    if (!updatedMarket.length) {
        await db
            .update(mandiSubcriptionCharges)
            .set({
                paymentStatus: "success",
                transactionId: input.razorpayPaymentId,
                paymentDate: new Date(),
            })
            .where(eq(mandiSubcriptionCharges.transactionId, input.razorpayOrderId))
    }

    return { success: true, paymentId: input.razorpayPaymentId }
}

// ─── Skip Payment (Mark Subscription Pending with Note) ──────────────────────
export const skipPayment = async ({
    input,
    ctx,
}: {
    input: {
        storeId: string
        vendorId: string
        vendorType: "market_vendor" | "mandi_vendor"
        note: string
    }
    ctx: AdminContext
}) => {
    try {
        const isMandi = input.vendorType === "mandi_vendor"
        const amountPaise = isMandi
            ? MANDI_REGISTRATION_AMOUNT_PAISE
            : MARKET_REGISTRATION_AMOUNT_PAISE
        const transactionId = `skipped_${Date.now()}`

        if (isMandi) {
            const [existingPending] = await db
                .select()
                .from(mandiSubcriptionCharges)
                .where(
                    and(
                        eq(mandiSubcriptionCharges.vendorId, input.vendorId),
                        eq(mandiSubcriptionCharges.paymentStatus, "pending"),
                    ),
                )
                .limit(1)

            if (existingPending) {
                await db
                    .update(mandiSubcriptionCharges)
                    .set({
                        amount: amountPaise,
                        transactionId,
                        paymentDate: new Date(),
                        paymentStatus: "pending",
                        paymentMethod: "cash",
                        paymentCollectedBy: ctx.admin.id,
                        note: input.note,
                    })
                    .where(eq(mandiSubcriptionCharges.id, existingPending.id))
            } else {
                await db.insert(mandiSubcriptionCharges).values({
                    vendorId: input.vendorId,
                    amount: amountPaise,
                    transactionId,
                    paymentDate: new Date(),
                    paymentStatus: "pending",
                    paymentMethod: "cash",
                    paymentCollectedBy: ctx.admin.id,
                    note: input.note,
                })
            }
        } else {
            const [existingPending] = await db
                .select()
                .from(marketSubcriptionCharges)
                .where(
                    and(
                        eq(marketSubcriptionCharges.vendorId, input.vendorId),
                        eq(marketSubcriptionCharges.paymentStatus, "pending"),
                    ),
                )
                .limit(1)

            if (existingPending) {
                await db
                    .update(marketSubcriptionCharges)
                    .set({
                        amount: amountPaise,
                        transactionId,
                        paymentDate: new Date(),
                        paymentStatus: "pending",
                        paymentMethod: "cash",
                        paymentCollectedBy: ctx.admin.id,
                        note: input.note,
                    })
                    .where(eq(marketSubcriptionCharges.id, existingPending.id))
            } else {
                await db.insert(marketSubcriptionCharges).values({
                    vendorId: input.vendorId,
                    amount: amountPaise,
                    transactionId,
                    paymentDate: new Date(),
                    paymentStatus: "pending",
                    paymentMethod: "cash",
                    paymentCollectedBy: ctx.admin.id,
                    note: input.note,
                })
            }
        }

        return { success: true, transactionId, amount: amountPaise } // in PAISE
    } catch (error: any) {
        console.error("[skipPayment] error:", error)
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error?.message || "Failed to skip payment",
            cause: error,
        })
    }
}
