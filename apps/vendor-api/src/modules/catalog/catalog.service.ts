import { db, eq, marketStore, mandiStore, veg } from "@ros/db"

export const findVendorStore = async (vendorId: string) => {
    const [vendorStore] = await db
        .select()
        .from(marketStore)
        .where(eq(marketStore.vendorId, vendorId))

    return vendorStore
}

export const availableVegiesInMandi = async (mandiId: string) => {
    const availVeg = db
        .select()
        .from(veg)
        .innerJoin(mandiStore, eq(veg.id, mandiStore.vegId))
        .where(eq(mandiStore.mandiId, mandiId))
    return availVeg
}
