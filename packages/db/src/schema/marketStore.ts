import { relations } from "drizzle-orm"
import { pgTable, uuid, integer, doublePrecision, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { marketVendor } from "./marketVendor"
import { city } from "./city"
import { mandi } from "./mandi"

export const marketStore = pgTable("market_store", {
    id: uuid("id").primaryKey().defaultRandom(),

    // assigned mandi to the vendor
    mandiId: uuid("mandi_id")
        .references(() => mandi.id, { onDelete: "restrict" })
        .notNull(),

    vendorId: uuid("vendor_id")
        .notNull()
        .references(() => marketVendor.id, { onDelete: "cascade" }),

    cityId: uuid("city_id")
        .notNull()
        .references(() => city.id, { onDelete: "restrict" }),

    // market store's latitude and longitude
    lat: doublePrecision().notNull(),
    lng: doublePrecision().notNull(),

    storeName: varchar("store_name", { length: 255 }),
    // url of storefront
    storeImage: varchar("store_image", { length: 500 }),

    fullAddress: varchar("full_address", { length: 500 }).notNull(),
    // serving capacity radius in meters
    radiusM: integer("radius_m").default(4000),

    ...timestamps,
})

export const marketStoreRelations = relations(marketStore, ({ one }) => ({
    // mandi this store belongs to
    mandi: one(mandi, {
        fields: [marketStore.mandiId],
        references: [mandi.id],
    }),

    // vendor/owner of this store
    marketVendor: one(marketVendor, {
        fields: [marketStore.vendorId],
        references: [marketVendor.id],
    }),

    // city this store is in
    city: one(city, {
        fields: [marketStore.cityId],
        references: [city.id],
    }),
}))

// Inferred types
export type MarketStoreInsert = typeof marketStore.$inferInsert
export type MarketStoreSelect = typeof marketStore.$inferSelect
