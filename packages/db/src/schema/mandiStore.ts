import { relations } from "drizzle-orm"
import { pgTable, uuid, integer, doublePrecision, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
// import { vendors } from "./vendors"
// import { kycDocs } from "./kycDocs"
import { mandiVendor } from "./mandiVendor"

export const mandiStore = pgTable("mandi_store", {
    id: uuid("id").primaryKey().defaultRandom(),
    mandiVendorId: uuid("vendor_id")
        .notNull()
        .references(() => mandiVendor.id),

    // mandi store's latitude and longitude
    lat: doublePrecision().notNull(),
    lng: doublePrecision().notNull(),

    // default serving radius in km
    radiusKm: integer("radius_km").default(4),
    fullAddress: varchar("full_address", { length: 500 }).notNull(),
    storeName: varchar({ length: 255 }),
    storeImage: varchar({ length: 500 }),

    ...timestamps,
})

export const mandiStoresRelations = relations(mandiStore, ({ one }) => ({
    mandiVendor: one(mandiVendor, {
        fields: [mandiStore.mandiVendorId],
        references: [mandiVendor.id],
    }),
    // kycDocs: one(kycDocs, {
    //     fields: [mandiStore.id],
    //     references: [kycDocs.storeId],
    // }),
}))
