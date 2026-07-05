import { relations } from "drizzle-orm"
import { pgTable, uuid, integer, doublePrecision, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { marketVendor } from "./marketVendor"
import { city } from "./city"

export const marketStore = pgTable("market_store", {
    id: uuid("id").primaryKey().defaultRandom(),

    marketVendorId: uuid("market_vendor_id")
        .notNull()
        .references(() => marketVendor.id, { onDelete: "cascade" }),

    cityId: uuid("city_id")
        .notNull()
        .references(() => city.id, { onDelete: "restrict" }),

    lat: doublePrecision().notNull(),
    lng: doublePrecision().notNull(),

    storeName: varchar("store_name", { length: 255 }),
    storeImage: varchar("store_image", { length: 500 }),

    fullAddress: varchar("full_address", { length: 500 }).notNull(),
    // serving capacity radius in meters
    radiusM: integer("radius_m").default(4000),

    ...timestamps,
})

export const marketStoreRelations = relations(marketStore, ({ one }) => ({
    // vendor/owner of this store
    marketVendor: one(marketVendor, {
        fields: [marketStore.marketVendorId],
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
