import { db, eq, and, gte, lte, ne } from "@ros/db"
import {
    marketMandiOrderItem,
    marketMandiOrder,
    mandiStore,
    veg,
    mandiCounter,
    mandi,
} from "@ros/db"

// write a function to pull orderedItems for a vendor where mandi id is assigned mandiId for that vendor
// and b/w creation time of orderItem should start of yesterday and time at the query has be made

export async function getPickupItems(storeId: string, mandiId: string) {
    const startOfYesterday = new Date()
    startOfYesterday.setDate(startOfYesterday.getDate() - 1)
    startOfYesterday.setHours(0, 0, 0, 0)

    const now = new Date()
    // Select items where:
    // - mandi id is assigned mandiId for that vendor (mandiStore.mandiId === mandiId)
    // - ordered for vendor (marketMandiOrder.marketStoreId === storeId)
    // - orderedItem creation time is between start of yesterday and now

    // 1. Fetch active orders in this timeframe
    const orders = await db
        .select({
            id: marketMandiOrder.id,
            status: marketMandiOrder.status,
            totalAmount: marketMandiOrder.totalAmount,
            orderCode: marketMandiOrder.orderCode,
        })
        .from(marketMandiOrder)
        .where(
            and(
                eq(marketMandiOrder.marketStoreId, storeId),
                gte(marketMandiOrder.placedAt, startOfYesterday),
                lte(marketMandiOrder.placedAt, now),
                ne(marketMandiOrder.status, "cancelled"),
                ne(marketMandiOrder.status, "rejected"),
            ),
        )

    // Check if any order is unpaid ("pending" status)
    const unpaidOrder = orders.find((o) => o.status === "pending")
    const isPaid = !unpaidOrder

    // If unpaid, retrieve mandi counter info
    let counterName: string | null = null
    let counterAddress: string | null = null
    let counterLat: number | null = null
    let counterLng: number | null = null
    let mandiName: string | null = null

    if (unpaidOrder) {
        // Query counter
        const counters = await db
            .select({
                counterName: mandiCounter.counterName,
                fullAddress: mandiCounter.fullAddress,
                lat: mandiCounter.lat,
                lng: mandiCounter.lng,
            })
            .from(mandiCounter)
            .where(and(eq(mandiCounter.mandiId, mandiId), eq(mandiCounter.isActive, true)))
            .limit(1)

        if (counters.length > 0) {
            counterName = counters[0]!.counterName
            counterAddress = counters[0]!.fullAddress
            counterLat = counters[0]!.lat
            counterLng = counters[0]!.lng
        }

        // Query mandi name
        const mandis = await db
            .select({
                name: mandi.name,
            })
            .from(mandi)
            .where(eq(mandi.id, mandiId))
            .limit(1)

        if (mandis.length > 0) {
            mandiName = mandis[0]!.name
        }
    }

    // 2. Fetch pickup items
    const items = await db
        .select({
            id: marketMandiOrderItem.id,
            vegId: marketMandiOrderItem.vegId,
            vegName: marketMandiOrderItem.vegNameSnapshot,
            quantityInGram: marketMandiOrderItem.quantityInGram,
            status: marketMandiOrderItem.status,
            shopName: marketMandiOrderItem.mandiStoreNameSnapshot,
            shopAddress: mandiStore.fullAddress,
            vegNameInHindi: veg.nameInHindi,
            vegPrimaryImage: veg.vegPrimaryImage,
            updatedAt: marketMandiOrderItem.updatedAt,
        })
        .from(marketMandiOrderItem)
        .innerJoin(marketMandiOrder, eq(marketMandiOrderItem.orderId, marketMandiOrder.id))
        .innerJoin(mandiStore, eq(marketMandiOrderItem.mandiStoreId, mandiStore.id))
        .innerJoin(veg, eq(marketMandiOrderItem.vegId, veg.id))
        .where(
            and(
                eq(marketMandiOrder.marketStoreId, storeId),
                eq(mandiStore.mandiId, mandiId),
                gte(marketMandiOrderItem.createdAt, startOfYesterday),
                lte(marketMandiOrderItem.createdAt, now),
                ne(marketMandiOrder.status, "cancelled"),
                ne(marketMandiOrder.status, "rejected"),
            ),
        )

    const mappedItems = items.map((item) => {
        // Map DB statuses to collected or pending
        // Collected: pickuped_up, delivered, fulfilled
        const isCollected = ["pickuped_up", "delivered", "fulfilled"].includes(item.status)
        return {
            id: item.id,
            vegId: item.vegId,
            vegName: item.vegName,
            vegNameInHindi: item.vegNameInHindi,
            vegImage: item.vegPrimaryImage,
            quantityKg: item.quantityInGram / 1000,
            status: isCollected ? ("collected" as const) : ("pending" as const),
            shopName: item.shopName,
            shopAddress: item.shopAddress,
            updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
        }
    })

    return {
        isPaid,
        totalAmountToPay: unpaidOrder ? unpaidOrder.totalAmount / 100 : 0, // convert paise to rupees
        orderId: unpaidOrder ? unpaidOrder.id : null,
        orderCode: unpaidOrder ? unpaidOrder.orderCode : null,
        counterName,
        counterAddress,
        counterLat,
        counterLng,
        mandiName,
        items: mappedItems,
    }
}
