import { db, eq, and, gte, lte, marketMandiOrder, marketStore, marketVendor } from "@ros/db"
import { TRPCError } from "@trpc/server"
import { getMandiStore, getOrders, getPrice, getVendorById } from "./vendor.service"

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
        const pricePerKg = priceRecord ? priceRecord.price / 100 : 0

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
                message: "Mandi store not found for this vendor",
            })
        }

        // 2. Fetch orders from database for this store and slot
        const slotNumber = parseInt(slotId.replace("slot", ""), 10) || 1

        const orders = await db
            .select({
                orderCode: marketMandiOrder.orderCode,
                marketStoreName: marketMandiOrder.marketStoreName,
                quantityInGram: marketMandiOrder.quantityInGram,
                status: marketMandiOrder.status,
                totalAmountInPaise: marketMandiOrder.totalAmountInPaise,
                createdAt: marketMandiOrder.createdAt,
            })
            .from(marketMandiOrder)
            .innerJoin(marketStore, eq(marketMandiOrder.marketStoreId, marketStore.id))
            .innerJoin(marketVendor, eq(marketStore.vendorId, marketVendor.id))
            .where(
                and(eq(marketMandiOrder.mandiStoreId, store.id), eq(marketStore.slot, slotNumber)),
            )

        // 3. Map database orders to Vendor interface
        return orders.map((o) => {
            let statusStr: "order-picked" | "cancelled" | "running-late" | "active" = "active"
            if (o.status === "confirmed" || o.status === "delivered") {
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
                : "04:00 AM"

            return {
                id: o.orderCode,
                name: o.marketStoreName,
                quantity: o.quantityInGram / 1000,
                status: statusStr,
                totalBill: o.totalAmountInPaise / 100,
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
        const vendor = await getVendorById(vendorId)
        if (!vendor) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Mandi vendor not found",
            })
        }

        return {
            id: vendorId,
            fullName: vendor.fullName,
            primaryPhone: vendor.primaryPhone,
            avatarUrl:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch vendor profile",
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
                quantityInGram: marketMandiOrder.quantityInGram,
                status: marketMandiOrder.status,
                totalAmountInPaise: marketMandiOrder.totalAmountInPaise,
                createdAt: marketMandiOrder.createdAt,
                slot: marketStore.slot,
            })
            .from(marketMandiOrder)
            .innerJoin(marketStore, eq(marketMandiOrder.marketStoreId, marketStore.id))
            .innerJoin(marketVendor, eq(marketStore.vendorId, marketVendor.id))
            .where(
                and(
                    eq(marketMandiOrder.mandiStoreId, store.id),
                    gte(marketMandiOrder.createdAt, start),
                    lte(marketMandiOrder.createdAt, end),
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
                pickupTime: string
            }>
        > = {}

        // Prepopulate slots 1 through 5
        for (let i = 1; i <= 5; i++) {
            grouped[i] = []
        }

        for (const o of orders) {
            const slotNum = o.slot || 1
            if (!grouped[slotNum]) {
                grouped[slotNum] = []
            }

            let statusStr: "order-picked" | "cancelled" | "running-late" | "active" = "active"
            if (o.status === "confirmed" || o.status === "delivered") {
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
                : "04:00 AM"

            grouped[slotNum].push({
                id: o.orderCode,
                name: o.marketStoreName,
                quantity: o.quantityInGram / 1000,
                status: statusStr,
                totalBill: o.totalAmountInPaise / 100,
                pickupTime: pickupTimeStr,
            })
        }

        return grouped
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch grouped vendor orders",
        })
    }
}

// Get all distinct slots of a vendor on a specific date
export async function getSlots(vendorId: string, date: string) {
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
            .selectDistinct({
                slot: marketStore.slot,
            })
            .from(marketMandiOrder)
            .innerJoin(marketStore, eq(marketMandiOrder.marketStoreId, marketStore.id))
            .innerJoin(marketVendor, eq(marketStore.vendorId, marketVendor.id))
            .where(
                and(
                    eq(marketMandiOrder.mandiStoreId, store.id),
                    gte(marketMandiOrder.createdAt, start),
                    lte(marketMandiOrder.createdAt, end),
                ),
            )

        return orders.map((o) => o.slot as number).sort((a, b) => a - b)
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch vendor slots",
        })
    }
}
