import {
    db,
    eq,
    and,
    mandi,
    marketVendorCart,
    veg,
    mandiStore,
    marketMandiOrder,
    marketMandiOrderItem,
    marketMandiPayment,
} from "@ros/db"
import { findVendorStore } from "../catalog/catalog.service"
import { razorpay } from "../../configs"
import { generateOrderCode } from "@ros/commons"
import { env } from "../../configs"
import crypto from "crypto"
import type { TPlaceOrderInput, TCheckoutDetails } from "./order.schema"

export async function getCheckoutDetails(vendorId: string): Promise<TCheckoutDetails> {
    const store = await findVendorStore(vendorId)
    if (!store) {
        throw new Error("Vendor store not found")
    }

    const [mandiDetails] = await db.select().from(mandi).where(eq(mandi.id, store.mandiId)).limit(1)

    if (!mandiDetails) {
        throw new Error("Assigned Mandi not found")
    }

    return {
        mandiName: mandiDetails.name,
        mandiAddress: mandiDetails.fullAddress || mandiDetails.name,
        slot: store.slot!,
        slotTime: "04:00 AM - 06:00 AM", // Fixed for all vendors as requested
    }
}

export async function createRazorpayOrder(
    vendorId: string,
    orderId?: string,
): Promise<{ orderId: string; amount: number }> {
    const store = await findVendorStore(vendorId)
    if (!store) {
        throw new Error("Vendor store not found")
    }

    let totalAmountPaise = 0

    if (orderId) {
        // Fetch order details to get total amount
        const [order] = await db
            .select()
            .from(marketMandiOrder)
            .where(
                and(eq(marketMandiOrder.id, orderId), eq(marketMandiOrder.marketStoreId, store.id)),
            )
            .limit(1)

        if (!order) {
            throw new Error("Order not found")
        }
        totalAmountPaise = order.totalAmount
    } else {
        // Get cart items and calculate total amount in paise
        const cartItems = await db
            .select({
                quantityInGram: marketVendorCart.quantityInGram,
                vegName: veg.name,
            })
            .from(marketVendorCart)
            .innerJoin(veg, eq(marketVendorCart.vegId, veg.id))
            .where(eq(marketVendorCart.marketStoreId, store.id))

        if (cartItems.length === 0) {
            throw new Error("Cart is empty")
        }

        for (const item of cartItems) {
            const quantityKg = item.quantityInGram / 1000
            const pricePerKgRupees = 12 + (item.vegName.length % 5) * 5
            const pricePerKgPaise = pricePerKgRupees * 100
            totalAmountPaise += Math.round(quantityKg * pricePerKgPaise)
        }
    }

    const order = await razorpay.orders.create({
        amount: totalAmountPaise,
        currency: "INR",
        receipt: `ord_${store.id.substring(0, 8)}`,
    })

    return {
        orderId: order.id,
        amount: totalAmountPaise,
    }
}

export async function placeOrder(
    vendorId: string,
    input: TPlaceOrderInput,
): Promise<{ id: string; orderCode: string }> {
    const store = await findVendorStore(vendorId)
    if (!store) {
        throw new Error("Vendor store not found")
    }

    // Fetch cart items
    const cartItems = await db
        .select({
            vegId: marketVendorCart.vegId,
            mandiStoreId: marketVendorCart.mandiStoreId,
            quantityInGram: marketVendorCart.quantityInGram,
            vegName: veg.name,
            storeName: mandiStore.storeName,
        })
        .from(marketVendorCart)
        .innerJoin(veg, eq(marketVendorCart.vegId, veg.id))
        .innerJoin(mandiStore, eq(marketVendorCart.mandiStoreId, mandiStore.id))
        .where(eq(marketVendorCart.marketStoreId, store.id))

    if (cartItems.length === 0) {
        throw new Error("Cart is empty")
    }

    // Calculate subtotal in paise
    let totalAmountPaise = 0
    const itemsData = cartItems.map((item) => {
        const quantityKg = item.quantityInGram / 1000
        const pricePerKgRupees = 12 + (item.vegName.length % 5) * 5
        const pricePerKgPaise = pricePerKgRupees * 100
        const itemTotalPaise = Math.round(quantityKg * pricePerKgPaise)
        totalAmountPaise += itemTotalPaise

        return {
            mandiStoreId: item.mandiStoreId,
            vegId: item.vegId,
            vegNameSnapshot: item.vegName,
            mandiStoreNameSnapshot: item.storeName || "Mandi Store",
            quantityInGram: item.quantityInGram,
            pricePerKg: pricePerKgPaise,
            totalAmount: itemTotalPaise,
        }
    })

    // Verify payment if online
    if (input.paymentMethod === "pay_online") {
        if (!input.paymentDetails) {
            throw new Error("Payment details missing for online payment")
        }
        const secret = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET!
        const body = `${input.paymentDetails.razorpayOrderId}|${input.paymentDetails.razorpayPaymentId}`
        const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex")
        if (expectedSignature !== input.paymentDetails.razorpaySignature) {
            throw new Error("Payment signature verification failed")
        }
    }

    const orderCode = generateOrderCode()
    const pickupCode = Math.floor(100000 + Math.random() * 900000).toString()

    // 1. Create order header
    const [orderHeader] = await db
        .insert(marketMandiOrder)
        .values({
            orderCode,
            marketStoreId: store.id,
            marketStoreName: store.storeName || "Vendor Store",
            idempotencyKey: input.idempotencyKey,
            status: input.paymentMethod === "pay_online" ? "confirmed" : "pending",
            fulfillmentType: "self_pickup",
            pickupCode,
            subtotal: totalAmountPaise,
            totalAmount: totalAmountPaise,
        })
        .returning()

    if (!orderHeader) {
        throw new Error("Failed to create order header")
    }

    // 2. Create order items
    for (const item of itemsData) {
        await db.insert(marketMandiOrderItem).values({
            orderId: orderHeader.id,
            mandiStoreId: item.mandiStoreId,
            vegId: item.vegId,
            vegNameSnapshot: item.vegNameSnapshot,
            mandiStoreNameSnapshot: item.mandiStoreNameSnapshot,
            quantityInGram: item.quantityInGram,
            pricePerKg: item.pricePerKg,
            totalAmount: item.totalAmount,
            status: "pending",
        })
    }

    // 3. Create payment record if paid online
    if (input.paymentMethod === "pay_online" && input.paymentDetails) {
        await db.insert(marketMandiPayment).values({
            orderId: orderHeader.id,
            idempotencyKey: input.idempotencyKey,
            provider: "razorpay",
            method: "upi",
            gatewayOrderId: input.paymentDetails.razorpayOrderId,
            gatewayPaymentId: input.paymentDetails.razorpayPaymentId,
            amount: totalAmountPaise,
            status: "captured",
            paidAt: new Date(),
        })
    }

    // 4. Clear the cart
    await db.delete(marketVendorCart).where(eq(marketVendorCart.marketStoreId, store.id))

    return {
        id: orderHeader.id,
        orderCode,
    }
}

export async function payOrder(
    vendorId: string,
    input: {
        orderId: string
        idempotencyKey: string
        paymentDetails: {
            razorpayOrderId: string
            razorpayPaymentId: string
            razorpaySignature: string
        }
    },
) {
    const store = await findVendorStore(vendorId)
    if (!store) {
        throw new Error("Vendor store not found")
    }

    const [order] = await db
        .select()
        .from(marketMandiOrder)
        .where(
            and(
                eq(marketMandiOrder.id, input.orderId),
                eq(marketMandiOrder.marketStoreId, store.id),
            ),
        )
        .limit(1)

    if (!order) {
        throw new Error("Order not found")
    }

    if (order.status !== "pending") {
        throw new Error("Order is already paid or processed")
    }

    // Verify signature
    const hmac = crypto.createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    hmac.update(`${input.paymentDetails.razorpayOrderId}|${input.paymentDetails.razorpayPaymentId}`)
    const generatedSignature = hmac.digest("hex")

    if (generatedSignature !== input.paymentDetails.razorpaySignature) {
        throw new Error("Payment signature verification failed")
    }

    // Update order status to confirmed
    await db
        .update(marketMandiOrder)
        .set({ status: "confirmed" })
        .where(eq(marketMandiOrder.id, order.id))

    // Create payment record
    await db.insert(marketMandiPayment).values({
        orderId: order.id,
        idempotencyKey: input.idempotencyKey,
        provider: "razorpay",
        method: "upi",
        gatewayOrderId: input.paymentDetails.razorpayOrderId,
        gatewayPaymentId: input.paymentDetails.razorpayPaymentId,
        amount: order.totalAmount,
        status: "captured",
        paidAt: new Date(),
    })

    return { success: true }
}
