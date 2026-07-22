import { db, eq, mandiPrice, mandiStore, mandiVendor, marketMandiOrder } from "@ros/db"

export const getMandiStore = async (vendorId: string) => {
    const [store] = await db.select().from(mandiStore).where(eq(mandiStore.mandiVendorId, vendorId))
    return store
}

export const getVendorById = async (vendorId: string) => {
    const [vendor] = await db.select().from(mandiVendor).where(eq(mandiVendor.id, vendorId))
    return vendor
}

export const getPrice = async (storeId: string) => {
    const [priceRecord] = await db
        .select()
        .from(mandiPrice)
        .where(eq(mandiPrice.mandiStoreId, storeId))
    return priceRecord
}

export const getOrders = async (storeId: string) => {
    const orders = await db
        .select()
        .from(marketMandiOrder)
        .where(eq(marketMandiOrder.mandiStoreId, storeId))
    return orders
}
