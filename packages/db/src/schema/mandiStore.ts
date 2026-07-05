import { relations } from "drizzle-orm"
import { pgTable, uuid, doublePrecision, varchar, integer } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { mandiVendor } from "./mandiVendor"
import { veg } from "./veg"

export const mandiStore = pgTable("mandi_store", {
    id: uuid("id").primaryKey().defaultRandom(),
    mandiVendorId: uuid("mandi_vendor_id")
        .references(() => mandiVendor.id)
        .notNull(),

    vegId: uuid("veg_id")
        .references(() => veg.id)
        .notNull(),

    // mandi store's latitude and longitude
    lat: doublePrecision().notNull(),
    lng: doublePrecision().notNull(),

    fullAddress: varchar("full_address", { length: 500 }).notNull(),
    storeName: varchar("store_name", { length: 255 }),
    storeImage: varchar("store_image", { length: 500 }),

    ...timestamps,
})

export const mandiStoresRelations = relations(mandiStore, ({ one }) => ({
    // vendor/owner of this store
    mandiVendor: one(mandiVendor, {
        fields: [mandiStore.mandiVendorId],
        references: [mandiVendor.id],
    }),

    // veg this store sales
    veg: one(veg, {
        fields: [mandiStore.vegId],
        references: [veg.id],
    }),
}))
