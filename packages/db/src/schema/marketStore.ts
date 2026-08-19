import { relations } from "drizzle-orm"
import { pgTable, uuid, integer, doublePrecision, varchar, boolean } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { marketVendor } from "./marketVendor"
import { mandi } from "./mandi"

import { marketStoreAgreement } from "./marketStoreAgreement"

export const marketStore = pgTable("market_store", {
    id: uuid("id").primaryKey().defaultRandom(),

    // assigned mandi to the store
    mandiId: uuid("mandi_id")
        .references(() => mandi.id, { onDelete: "restrict" })
        .notNull(),

    vendorId: uuid("vendor_id")
        .notNull()
        .references(() => marketVendor.id, { onDelete: "cascade" }),

    // market store's latitude and longitude
    lat: doublePrecision().notNull(),
    lng: doublePrecision().notNull(),

    storeName: varchar("store_name", { length: 255 }),
    // url of storefront
    storeImage: varchar("store_image", { length: 500 }),

    fullAddress: varchar("full_address", { length: 500 }).notNull(),
    // serving capacity radius in meters
    radiusM: integer("radius_m").default(4000),

    // slot is kind of batch, this will contain 10 vendor or stores of market vendor in a slot/batch then next slot will be assigned to new vendor,
    // and it will be probably based on sequence like first 10 vendor in slot 1 then 11 - 20 vendor in slot 2
    slot: integer(),

    isActive: boolean("is_active").default(false).notNull(),

    // approved by admin (by default not approved)
    isApproved: boolean("is_approved").default(false).notNull(),

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

    agreement: one(marketStoreAgreement),
}))

// Inferred types
export type MarketStoreInsert = typeof marketStore.$inferInsert
export type MarketStoreSelect = typeof marketStore.$inferSelect
