import { db, eq, marketVendor } from "@ros/db"

export const findMarketVendorByPhone = async ({ phone }: { phone: string }) => {
    const [marketVendorRecord] = await db
        .select()
        .from(marketVendor)
        .where(eq(marketVendor.primaryPhone, phone))
    return marketVendorRecord
}

export const getMarketVendorById = async (id: string) => {
    const [marketVendorRecord] = await db.select().from(marketVendor).where(eq(marketVendor.id, id))
    return marketVendorRecord
}
