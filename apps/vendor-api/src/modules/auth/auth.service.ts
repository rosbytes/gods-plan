import { db, eq, marketVendor } from "@ros/db"

export const findMarketVendorByPhone = async ({ phone }: { phone: string }) => {
    return await db.query.marketVendor.findFirst({
        where: eq(marketVendor.primaryPhone, phone),
    })
}

export const getMarketVendorById = async (id: string) => {
    return await db.query.marketVendor.findFirst({
        where: eq(marketVendor.id, id),
    })
}
