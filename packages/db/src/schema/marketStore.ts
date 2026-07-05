import { relations } from "drizzle-orm"
import { pgTable, uuid, integer, doublePrecision, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { marketVendor } from "./marketVendor"
// import { kycDocs } from "./kycDocs"

export const marketStore = pgTable("market_store", {
    id: uuid("id").primaryKey().defaultRandom(),

    marketVendorId: uuid("vendor_id")
        .notNull()
        .references(() => marketVendor.id),

    lat: doublePrecision().notNull(),
    lng: doublePrecision().notNull(),

    storeName: varchar("store_name", { length: 255 }),
    storeImage: varchar("store_image", { length: 500 }),

    fullAddress: varchar("full_address", { length: 500 }).notNull(),
    // serving capacity radius in meters
    radiusKm: integer("radius_km").default(4000),

    ...timestamps,
})

export const marketStoreRelations = relations(marketStore, ({ one }) => ({
    // vendor  owner of this store
    marketVendor: one(marketVendor, {
        fields: [marketStore.marketVendorId],
        references: [marketVendor.id],
    }),
    // kycDocs: one(kycDocs, {
    //     fields: [marketStore.id],
    //     references: [kycDocs.storeId],
    // }),
}))
