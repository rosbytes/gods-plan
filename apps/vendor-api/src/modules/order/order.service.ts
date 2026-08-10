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
    desc,
    marketVendorWallet,
    mandiPrice,
    marketMandiOrderStatusHistory,
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

export async function getOrders(vendorId: string, input: { searchQuery?: string | undefined }) {
    const store = await findVendorStore(vendorId)
    if (!store) {
        throw new Error("Vendor store not found")
    }

    const orders = await db
        .select({
            id: marketMandiOrder.id,
            orderCode: marketMandiOrder.orderCode,
            status: marketMandiOrder.status,
            placedAt: marketMandiOrder.placedAt,
            totalAmount: marketMandiOrder.totalAmount,
            subtotal: marketMandiOrder.subtotal,
        })
        .from(marketMandiOrder)
        .where(eq(marketMandiOrder.marketStoreId, store.id))
        .orderBy(desc(marketMandiOrder.placedAt))

    const orderList = []

    for (const order of orders) {
        const orderIdStr = order.orderCode.toLowerCase()
        const formattedDate = order.placedAt
            .toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
            })
            .toLowerCase()

        if (input.searchQuery) {
            const search = input.searchQuery.toLowerCase().trim()
            if (!orderIdStr.includes(search) && !formattedDate.includes(search)) {
                continue
            }
        }

        // Count order items
        const items = await db
            .select({
                quantityInGram: marketMandiOrderItem.quantityInGram,
            })
            .from(marketMandiOrderItem)
            .where(eq(marketMandiOrderItem.orderId, order.id))

        const totalQuantityKg = items.reduce((sum, i) => sum + i.quantityInGram, 0) / 1000
        const totalItemsCount = items.length

        // Fetch payment method
        const payments = await db
            .select({
                provider: marketMandiPayment.provider,
                method: marketMandiPayment.method,
                status: marketMandiPayment.status,
            })
            .from(marketMandiPayment)
            .where(
                and(
                    eq(marketMandiPayment.orderId, order.id),
                    eq(marketMandiPayment.status, "captured"),
                ),
            )
            .limit(1)

        let paymentLabel = "Unpaid"
        if (payments.length > 0) {
            const pay = payments[0]!
            if (pay.provider === "manual" || pay.method === "cash") {
                paymentLabel = "Paid Cash at ROS Counter"
            } else {
                paymentLabel = "Paid Online"
            }
        } else if (order.status === "confirmed" && order.subtotal > 0) {
            paymentLabel = "Paid Cash at ROS Counter"
        }

        // Determine status display value
        let statusLabel: "Pickup Pending" | "Completed" | "Cancelled" | "Pickup Failed" =
            "Pickup Pending"

        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const isPastOrder = order.placedAt.getTime() < todayStart.getTime()

        if (["cancelled", "rejected"].includes(order.status)) {
            statusLabel = "Cancelled"
        } else if (["pickuped_up", "delivered", "fulfilled"].includes(order.status)) {
            statusLabel = "Completed"
        } else {
            if (isPastOrder) {
                statusLabel = "Pickup Failed"
            } else {
                statusLabel = "Pickup Pending"
            }
        }

        orderList.push({
            id: order.id,
            orderCode: order.orderCode,
            statusLabel,
            placedAt: order.placedAt.toISOString(),
            totalQuantityKg,
            totalItemsCount,
            totalAmount: order.totalAmount / 100,
            paymentLabel,
        })
    }

    return orderList
}

export async function getOrderDetails(vendorId: string, orderId: string) {
    const store = await findVendorStore(vendorId)
    if (!store) {
        throw new Error("Vendor store not found")
    }

    // 1. Fetch order header
    const [order] = await db
        .select()
        .from(marketMandiOrder)
        .where(and(eq(marketMandiOrder.id, orderId), eq(marketMandiOrder.marketStoreId, store.id)))
        .limit(1)

    if (!order) {
        throw new Error("Order not found")
    }

    // 2. Fetch Mandi details
    const [mandiDetails] = await db.select().from(mandi).where(eq(mandi.id, store.mandiId)).limit(1)

    if (!mandiDetails) {
        throw new Error("Assigned Mandi not found")
    }

    // 3. Fetch order items with veg snapshots
    const items = await db
        .select({
            id: marketMandiOrderItem.id,
            mandiStoreId: marketMandiOrderItem.mandiStoreId,
            quantityInGram: marketMandiOrderItem.quantityInGram,
            vegId: marketMandiOrderItem.vegId,
            vegName: marketMandiOrderItem.vegNameSnapshot,
            pricePerKg: marketMandiOrderItem.pricePerKg,
            vegNameInHindi: veg.nameInHindi,
            vegPrimaryImage: veg.vegPrimaryImage,
        })
        .from(marketMandiOrderItem)
        .innerJoin(veg, eq(marketMandiOrderItem.vegId, veg.id))
        .where(eq(marketMandiOrderItem.orderId, order.id))

    const mappedItems = []
    let estimatedTotal = 0
    let walletAdjustment = 0

    for (const item of items) {
        const quantityKg = item.quantityInGram / 1000

        // Find latest price record in mandiPrice for this vegetable
        const [priceRecord] = await db
            .select()
            .from(mandiPrice)
            .where(
                and(
                    eq(mandiPrice.mandiStoreId, item.mandiStoreId),
                    eq(mandiPrice.vegId, item.vegId),
                ),
            )
            .orderBy(desc(mandiPrice.createdAt))
            .limit(1)

        const estimatedPrice = item.pricePerKg / 100
        const actualPrice = priceRecord ? priceRecord.price / 100 : estimatedPrice
        const diffAmount = (actualPrice - estimatedPrice) * quantityKg
        const subtotal = actualPrice * quantityKg

        estimatedTotal += estimatedPrice * quantityKg
        walletAdjustment += diffAmount

        mappedItems.push({
            id: item.id,
            veg: {
                id: item.vegId,
                name: item.vegName,
                nameInHindi: item.vegNameInHindi,
                vegPrimaryImage: item.vegPrimaryImage,
                estimatedPrice,
            },
            quantityKg,
            estimatedPrice,
            actualPrice,
            diffAmount,
            subtotal,
        })
    }

    const totalWeight = mappedItems.reduce((sum, item) => sum + item.quantityKg, 0)

    // Check payment method from payment record
    const payments = await db
        .select()
        .from(marketMandiPayment)
        .where(
            and(
                eq(marketMandiPayment.orderId, order.id),
                eq(marketMandiPayment.status, "captured"),
            ),
        )
        .limit(1)

    const refundedPayments = await db
        .select()
        .from(marketMandiPayment)
        .where(
            and(
                eq(marketMandiPayment.orderId, order.id),
                eq(marketMandiPayment.status, "refunded"),
            ),
        )
        .limit(1)

    const isOnline = payments.length > 0 && payments[0]!.provider === "razorpay"
    let paymentMethod = isOnline ? "Online" : "Cash"
    if (
        order.status === "cancelled" ||
        order.status === "rejected" ||
        order.status === "refunded"
    ) {
        if (refundedPayments.length > 0 || order.status === "refunded") {
            paymentMethod = "Refunded"
        } else if (payments.length > 0) {
            paymentMethod = "Refund Initiated"
        } else {
            paymentMethod = "Not Paid"
        }
    }

    const paymentPaidAtStr =
        payments.length > 0 && payments[0]!.paidAt
            ? payments[0]!.paidAt.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
              }) +
              ", " +
              payments[0]!.paidAt.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
              })
            : null

    let pickupTimeStr = "Pending"
    if (["pickuped_up", "delivered", "fulfilled"].includes(order.status)) {
        const complDate = order.updatedAt || order.placedAt
        pickupTimeStr = complDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
    } else {
        pickupTimeStr = "04:00 AM"
    }

    let statusLabel: "Pickup Pending" | "Completed" | "Cancelled" | "Pickup Failed" =
        "Pickup Pending"
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const isPastOrder = order.placedAt.getTime() < todayStart.getTime()

    if (["cancelled", "rejected"].includes(order.status)) {
        statusLabel = "Cancelled"
    } else if (["pickuped_up", "delivered", "fulfilled"].includes(order.status)) {
        statusLabel = "Completed"
    } else {
        if (isPastOrder) {
            statusLabel = "Pickup Failed"
        } else {
            statusLabel = "Pickup Pending"
        }
    }

    let cancelledBy = ""
    let cancellationReason = order.cancellationReason || ""

    if (order.status === "cancelled" || order.status === "rejected") {
        const [historyRecord] = await db
            .select()
            .from(marketMandiOrderStatusHistory)
            .where(
                and(
                    eq(marketMandiOrderStatusHistory.orderId, order.id),
                    eq(marketMandiOrderStatusHistory.toStatus, order.status),
                ),
            )
            .orderBy(desc(marketMandiOrderStatusHistory.createdAt))
            .limit(1)

        if (historyRecord) {
            if (historyRecord.triggeredBy === "market_store") {
                cancelledBy = "You"
            } else if (historyRecord.triggeredBy === "mandi_store") {
                cancelledBy = "Mandi"
            } else {
                cancelledBy = "ROS Team"
            }
            if (!cancellationReason) {
                cancellationReason = historyRecord.reason || ""
            }
        } else {
            cancelledBy = "ROS Team"
        }
        if (!cancellationReason) {
            cancellationReason = "Found a better price elsewhere"
        }
    }

    const placedTimeStr = order.placedAt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    })
    const placedDateStr = order.placedAt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })
    const placedAtTimeDate = `${placedTimeStr}, ${placedDateStr}`

    // Fetch vendor wallet balance
    const [wallet] = await db
        .select()
        .from(marketVendorWallet)
        .where(eq(marketVendorWallet.vendorId, vendorId))
        .limit(1)

    const walletBalance = wallet ? wallet.balance / 100 : 0

    return {
        orderId: order.id,
        orderCode: order.orderCode,
        statusLabel,
        placedAt: order.status === "cancelled" ? placedAtTimeDate : placedDateStr,
        pickupTime: pickupTimeStr,
        paymentMethod,
        paymentPaidAt: paymentPaidAtStr,
        walletBalance,
        cancelledBy,
        cancellationReason,
        checkoutDetails: {
            mandiName: mandiDetails.name,
            mandiAddress: mandiDetails.fullAddress || mandiDetails.name,
            slot: store.slot || 1,
            slotTime: "04:00 AM - 06:00 AM",
        },
        items: mappedItems,
        totalItems: mappedItems.length,
        totalWeight,
        estimatedTotal,
        walletAdjustment,
        amountToPay: estimatedTotal + walletAdjustment,
    }
}
