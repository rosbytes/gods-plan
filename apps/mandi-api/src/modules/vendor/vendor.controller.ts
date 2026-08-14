import { db, eq, and, gte, lte, marketMandiOrder, marketMandiOrderItem, marketStore } from "@ros/db"
import { TRPCError } from "@trpc/server"
import {
    getMandiStore,
    getOrders,
    getPrice,
    createPrice,
    getFullProfile,
    getFinanceStatsForStore,
    searchOrdersByQuery,
} from "./vendor.service"

export async function updatePrice({ vendorId, price }: { vendorId: string; price: number }) {
    try {
        const store = await getMandiStore(vendorId)
        if (!store) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Mandi store not found for this vendor",
            })
        }

        const priceInPaise = Math.round(price * 100)
        const updatedPrice = await createPrice(store.id, store.vegId, priceInPaise)

        if (!updatedPrice) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to save updated price record",
            })
        }

        return {
            success: true,
            price: updatedPrice.price / 100,
        }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update price",
        })
    }
}

export async function getHomeStats({ vendorId }: { vendorId: string }) {
    try {
        // 1. Get the store for this vendor
        const store = await getMandiStore(vendorId)
        if (!store) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Mandi store not found for this vendor",
            })
        }

        // 2. Get the current vegetable price for the store
        const priceRecord = await getPrice(store.id)
        const pricePerKg = priceRecord ? priceRecord.price / 100 : null

        // 3. Get the orders placed for this store
        const orders = await getOrders(store.id)

        const totalOrders = orders.length
        const totalQuantityKg = orders.reduce((sum, o) => sum + o.quantityInGram / 1000, 0)

        return {
            pricePerKg,
            totalOrders,
            totalQuantityKg,
        }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch home stats",
        })
    }
}

export async function getSlotOrders({ vendorId, slotId }: { vendorId: string; slotId: string }) {
    try {
        // 1. Get the store for this vendor
        const store = await getMandiStore(vendorId)

        if (!store) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Mandi store not found",
            })
        }

        // 2. Fetch orders from database for this store and slot
        const slotNumber = parseInt(slotId.replace("slot", ""), 10) || 1

        const orders = await db
            .select({
                orderCode: marketMandiOrder.orderCode,
                marketStoreName: marketMandiOrder.marketStoreName,
                quantityInGram: marketMandiOrderItem.quantityInGram,
                status: marketMandiOrderItem.status,
                totalAmount: marketMandiOrderItem.totalAmount,
                createdAt: marketMandiOrderItem.createdAt,
            })
            .from(marketMandiOrderItem)
            .innerJoin(marketMandiOrder, eq(marketMandiOrderItem.orderId, marketMandiOrder.id))
            .innerJoin(marketStore, eq(marketMandiOrder.marketStoreId, marketStore.id))
            .where(
                and(
                    eq(marketMandiOrderItem.mandiStoreId, store.id),
                    eq(marketStore.slot, slotNumber),
                ),
            )

        // 3. Map database orders to Vendor interface
        return orders.map((o) => {
            let statusStr: "order-picked" | "cancelled" | "running-late" | "active" = "active"
            if (o.status === "confirmed" || o.status === "delivered" || o.status === "accepted") {
                statusStr = "order-picked"
            } else if (o.status === "cancelled" || o.status === "rejected") {
                statusStr = "cancelled"
            } else if (o.status === "out_for_delivery") {
                statusStr = "running-late"
            } else if (o.status === "pending") {
                statusStr = "active"
            }

            const pickupTimeStr = o.createdAt
                ? new Date(o.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                  })
                : undefined

            return {
                id: o.orderCode,
                name: o.marketStoreName,
                quantity: o.quantityInGram / 1000,
                status: statusStr,
                totalBill: o.totalAmount / 100,
                pickupTime: pickupTimeStr,
            }
        })
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch slot orders",
        })
    }
}

export async function getProfile(vendorId: string) {
    try {
        const profile = await getFullProfile(vendorId)
        if (!profile) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Mandi vendor not found",
            })
        }
        return profile
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch vendor profile",
        })
    }
}

export async function getFinanceStats({ vendorId, date }: { vendorId: string; date: string }) {
    try {
        const store = await getMandiStore(vendorId)
        if (!store) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Mandi store not found",
            })
        }

        if (isNaN(new Date(date).getTime())) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid date format" })
        }

        return getFinanceStatsForStore(store.id, date)
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch finance stats",
        })
    }
}

export async function searchOrders({ vendorId, query }: { vendorId: string; query: string }) {
    try {
        const store = await getMandiStore(vendorId)
        if (!store) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Mandi store not found",
            })
        }

        const results = await searchOrdersByQuery(store.id, query.trim())

        return results.map((o) => {
            let statusStr: "order-picked" | "cancelled" | "running-late" | "active" = "active"
            if (o.status === "confirmed" || o.status === "delivered" || o.status === "accepted") {
                statusStr = "order-picked"
            } else if (o.status === "cancelled" || o.status === "rejected") {
                statusStr = "cancelled"
            } else if (o.status === "out_for_delivery") {
                statusStr = "running-late"
            }

            const pickupTimeStr = o.createdAt
                ? new Date(o.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                  })
                : undefined

            return {
                id: o.orderCode,
                name: o.marketStoreName,
                quantity: o.quantityInGram / 1000,
                status: statusStr,
                totalBill: o.totalAmount / 100,
                pickupTime: pickupTimeStr,
                slot: o.slot ?? null,
            }
        })
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to search orders",
        })
    }
}

// Get All the orders of a spefic vendor of a date grouped by slots of market vendors
export async function getGroupedOrders({ vendorId, date }: { vendorId: string; date: string }) {
    try {
        // 1. Get the store for this vendor
        const store = await getMandiStore(vendorId)
        if (!store) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Mandi store not found",
            })
        }

        // 2. Compute date bounds in UTC format
        const start = new Date(date)
        if (isNaN(start.getTime())) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Invalid date format",
            })
        }
        start.setUTCHours(0, 0, 0, 0)
        const end = new Date(date)
        end.setUTCHours(23, 59, 59, 999)

        // 3. Query all orders for the store within bounds
        const orders = await db
            .select({
                id: marketMandiOrder.id,
                orderCode: marketMandiOrder.orderCode,
                marketStoreName: marketMandiOrder.marketStoreName,
                quantityInGram: marketMandiOrderItem.quantityInGram,
                status: marketMandiOrderItem.status,
                totalAmount: marketMandiOrderItem.totalAmount,
                createdAt: marketMandiOrderItem.createdAt,
                slot: marketStore.slot,
            })
            .from(marketMandiOrderItem)
            .innerJoin(marketMandiOrder, eq(marketMandiOrderItem.orderId, marketMandiOrder.id))
            .innerJoin(marketStore, eq(marketMandiOrder.marketStoreId, marketStore.id))
            .where(
                and(
                    eq(marketMandiOrderItem.mandiStoreId, store.id),
                    gte(marketMandiOrderItem.createdAt, start),
                    lte(marketMandiOrderItem.createdAt, end),
                ),
            )

        // 4. Group orders by slot number
        const grouped: Record<
            number,
            Array<{
                id: string
                name: string
                quantity: number
                status: "order-picked" | "cancelled" | "running-late" | "active"
                totalBill: number
                pickupTime: string | undefined
            }>
        > = {}

        for (const o of orders) {
            const slotNum = o.slot
            if (!slotNum) continue // skip orders with no slot assignment
            if (!grouped[slotNum]) {
                grouped[slotNum] = []
            }

            let statusStr: "order-picked" | "cancelled" | "running-late" | "active" = "active"
            if (o.status === "confirmed" || o.status === "delivered" || o.status === "accepted") {
                statusStr = "order-picked"
            } else if (o.status === "cancelled" || o.status === "rejected") {
                statusStr = "cancelled"
            } else if (o.status === "out_for_delivery") {
                statusStr = "running-late"
            } else if (o.status === "pending") {
                statusStr = "active"
            }

            const pickupTimeStr = o.createdAt
                ? new Date(o.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                  })
                : undefined

            grouped[slotNum].push({
                id: o.orderCode,
                name: o.marketStoreName,
                quantity: o.quantityInGram / 1000,
                status: statusStr,
                totalBill: o.totalAmount / 100,
                pickupTime: pickupTimeStr,
            })
        }

        return grouped
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch grouped orders",
        })
    }
}
