import { db, eq, and, marketStore, mandiStore, mandiPrice, veg, sql } from "@ros/db"

export const findVendorStore = async (vendorId: string) => {
    const [vendorStore] = await db
        .select()
        .from(marketStore)
        .where(eq(marketStore.vendorId, vendorId))

    return vendorStore
}

export const availableVegiesInMandi = async (mandiId: string) => {
    // Subquery: latest price row for each (mandiStoreId, vegId) pair
    const latestPrice = db
        .select({
            mandiStoreId: mandiPrice.mandiStoreId,
            vegId: mandiPrice.vegId,
            price: mandiPrice.price,
        })
        .from(mandiPrice)
        .where(
            sql`(${mandiPrice.mandiStoreId}, ${mandiPrice.vegId}, ${mandiPrice.createdAt}) IN (
                SELECT ${mandiPrice.mandiStoreId}, ${mandiPrice.vegId}, MAX(${mandiPrice.createdAt})
                FROM ${mandiPrice}
                GROUP BY ${mandiPrice.mandiStoreId}, ${mandiPrice.vegId}
            )`,
        )
        .as("latest_price")

    const availVeg = await db
        .select({
            veg: {
                id: veg.id,
                name: veg.name,
                nameInHindi: veg.nameInHindi,
                vegPrimaryImage: veg.vegPrimaryImage,
            },
            mandi_store: {
                id: mandiStore.id,
                mandiId: mandiStore.mandiId,
            },
            // price in paise; null when no price has been set yet
            priceInPaise: latestPrice.price,
        })
        .from(veg)
        .innerJoin(mandiStore, and(eq(veg.id, mandiStore.vegId), eq(mandiStore.mandiId, mandiId)))
        .leftJoin(
            latestPrice,
            and(eq(latestPrice.mandiStoreId, mandiStore.id), eq(latestPrice.vegId, veg.id)),
        )

    return availVeg
}
