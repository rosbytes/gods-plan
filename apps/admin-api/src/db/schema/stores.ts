import { relations } from "drizzle-orm"
import { pgTable, uuid, integer, doublePrecision, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../columnHelpers"
import { vendors } from "./vendors"
import { kycDocs } from "./kycDocs"

export const stores = pgTable("stores", {
    id: uuid("id").primaryKey().defaultRandom(),
    vendorId: uuid("vendor_id")
        .notNull()
        .references(() => vendors.id),
    lat: doublePrecision().notNull(),
    lng: doublePrecision().notNull(),
    // default serving radius in km
    radiusKm: integer("radius_km").default(4),
    fullAddress: varchar("full_address", { length: 500 }).notNull(),
    storeName: varchar({ length: 255 }),
    storeImage: varchar({ length: 500 }),
    ...timestamps,
})

export const storesRelations = relations(stores, ({ one }) => ({
    vendor: one(vendors, {
        fields: [stores.vendorId],
        references: [vendors.id],
    }),
    kycDocs: one(kycDocs, {
        fields: [stores.id],
        references: [kycDocs.storeId],
    }),
}))
