import { db, eq, desc, mandiPrice, mandiStore, mandiVendor, marketMandiOrderItem } from "@ros/db"

export const getMandiStore = async (vendorId: string) => {
    const [store] = await db.select().from(mandiStore).where(eq(mandiStore.vendorId, vendorId))
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
        .orderBy(desc(mandiPrice.createdAt))
        .limit(1)
    return priceRecord
}

export const createPrice = async (storeId: string, vegId: string, priceInPaise: number) => {
    const [inserted] = await db
        .insert(mandiPrice)
        .values({
            mandiStoreId: storeId,
            vegId: vegId,
            price: priceInPaise,
        })
        .returning()
    return inserted
}

export const getOrders = async (storeId: string) => {
    const orders = await db
        .select()
        .from(marketMandiOrderItem)
        .where(eq(marketMandiOrderItem.mandiStoreId, storeId))
    return orders
}
