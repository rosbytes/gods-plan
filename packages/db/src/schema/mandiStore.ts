import { relations } from "drizzle-orm"
import { pgTable, uuid, doublePrecision, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { mandiVendor } from "./mandiVendor"
import { mandi } from "./mandi"
import { veg } from "./veg"
import { mandiPrice } from "./mandiPrice"

export const mandiStore = pgTable("mandi_store", {
    id: uuid("id").primaryKey().defaultRandom(),

    // assigned mandi to the store
    mandiId: uuid("mandi_id")
        .references(() => mandi.id, { onDelete: "restrict" })
        .notNull(),

    vendorId: uuid("vendor_id")
        .references(() => mandiVendor.id, { onDelete: "cascade" })
        .notNull(),

    vegId: uuid("veg_id")
        .references(() => veg.id, { onDelete: "restrict" })
        .notNull(),

    // mandi store's latitude and longitude
    lat: doublePrecision().notNull(),
    lng: doublePrecision().notNull(),

    storeName: varchar("store_name", { length: 255 }),
    // url of storefront
    storeImage: varchar("store_image", { length: 500 }),

    fullAddress: varchar("full_address", { length: 500 }).notNull(),

    ...timestamps,
})

export const mandiStoresRelations = relations(mandiStore, ({ one, many }) => ({
    // mandi this store belongs to
    mandi: one(mandi, {
        fields: [mandiStore.mandiId],
        references: [mandi.id],
    }),

    // vendor/owner of this store
    mandiVendor: one(mandiVendor, {
        fields: [mandiStore.vendorId],
        references: [mandiVendor.id],
    }),

    // veg this store sells
    veg: one(veg, {
        fields: [mandiStore.vegId],
        references: [veg.id],
    }),

    // price history for this store
    mandiPrices: many(mandiPrice),
}))

// Inferred types
export type MandiStoreInsert = typeof mandiStore.$inferInsert
export type MandiStoreSelect = typeof mandiStore.$inferSelect
