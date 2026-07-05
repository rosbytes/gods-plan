import { TRPCError } from "@trpc/server"
import { razorpay } from "../../configs"
import { db, registrationCharges, vendors } from "../../db"
import { eq } from "drizzle-orm"
import crypto from "crypto"
import type { Context } from "../../trpc/context"

const REGISTRATION_AMOUNT = 5000 // ₹5000 in INR (Razorpay uses paise, so multiply by 100)

// ─── Create Razorpay Order ────────────────────────────────────────────────────
export const createOrder = async ({
    input,
}: {
    input: { storeId: string; vendorId: string }
    ctx: Context
}) => {
    try {
        console.log("[createOrder] Input received:", input)
        console.log("[createOrder] Creating razorpay order...")
        const order = await razorpay.orders.create({
            amount: REGISTRATION_AMOUNT * 100, // paise
            currency: "INR",
            receipt: `reg_${input.storeId.substring(0, 8)}`,
            notes: {
                storeId: input.storeId,
                vendorId: input.vendorId,
                type: "store_registration",
            },
        })
        console.log("[createOrder] Razorpay order created:", order.id)

        console.log("[createOrder] Creating pending record in DB...")
        // Create a pending record in DB
        await db.insert(registrationCharges).values({
            storeId: input.storeId,
            vendorId: input.vendorId,
            amount: REGISTRATION_AMOUNT,
            transactionId: order.id,
            paymentDate: new Date(),
            paymentStatus: "pending",
            paymentMethod: "upi",
        })
        console.log("[createOrder] DB record inserted!")

        // Fetch Vendor Data for Prefill
        const vendorQuery = await db
            .select()
            .from(vendors)
            .where(eq(vendors.id, input.vendorId))
            .limit(1)
        const vendorData = vendorQuery[0]

        return {
            orderId: order.id,
            amount: REGISTRATION_AMOUNT,
            currency: "INR",
            keyId: process.env["RAZORPAY_KEY_ID"]!,
            vendorContact: vendorData?.primaryPhone || "",
            vendorName: vendorData?.fullName || "",
        }
    } catch (error: any) {
        console.error("[createOrder] error:", error?.error || error?.response?.data || error)
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create payment order",
            cause: error,
        })
    }
}

// ─── Get Payment Status ───────────────────────────────────────────────────────
export const getPaymentStatus = async ({ input }: { input: { orderId: string }; ctx: Context }) => {
    try {
        // Check DB first — webhook may have already updated it
        const [record] = await db
            .select()
            .from(registrationCharges)
            .where(eq(registrationCharges.transactionId, input.orderId))
            .limit(1)

        if (!record) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" })
        }

        // If already resolved, return the DB status
        if (record.paymentStatus === "success" || record.paymentStatus === "failed") {
            return {
                status: record.paymentStatus,
                paymentId: record.transactionId,
                method: record.paymentMethod,
                amount: record.amount,
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
            await db
                .update(registrationCharges)
                .set({ paymentStatus: "success", transactionId: paid.id, paymentDate: new Date() })
                .where(eq(registrationCharges.transactionId, input.orderId))

            return {
                status: "success" as const,
                paymentId: paid.id,
                method: paid.method ?? "upi",
                amount: REGISTRATION_AMOUNT,
                paidAt: new Date(),
            }
        }

        return {
            status: "pending" as const,
            paymentId: null,
            method: null,
            amount: REGISTRATION_AMOUNT,
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
    ctx: Context
}) => {
    const secret = process.env["RAZORPAY_KEY_SECRET"]!
    const body = `${input.razorpayOrderId}|${input.razorpayPaymentId}`
    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex")

    if (expectedSignature !== input.razorpaySignature) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid payment signature" })
    }

    await db
        .update(registrationCharges)
        .set({
            paymentStatus: "success",
            transactionId: input.razorpayPaymentId,
            paymentDate: new Date(),
        })
        .where(eq(registrationCharges.transactionId, input.razorpayOrderId))

    return { success: true, paymentId: input.razorpayPaymentId }
}
