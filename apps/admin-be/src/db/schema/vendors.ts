import { relations } from "drizzle-orm"
import { pgTable, uuid, varchar, pgEnum } from "drizzle-orm/pg-core"
import { timestamps } from "../columnHelpers"
import { stores } from "./stores"
import { kycDocs } from "./kycDocs"
import { admin } from "./admin"
import { z } from "zod"

export const vendorTypeArray = ["market_vendor", "mandi_vendor"] as const
export const ZVendorType = z.enum(vendorTypeArray)
export type TVendorType = z.infer<typeof ZVendorType>

export const vendorType = pgEnum("vendor_type", vendorTypeArray)

export const vendors = pgTable("vendors", {
    id: uuid().primaryKey().defaultRandom(),
    fullName: varchar({ length: 255 }).notNull(),
    // phone should of length 15
    primaryPhone: varchar({ length: 20 }).unique().notNull(),
    alternatePhone: varchar({ length: 20 }),
    // type of vendor
    type: vendorType("type").notNull(),

    createdBy: uuid("created_by").notNull(),
    ...timestamps,
})

export const vendorRelations = relations(vendors, ({ one, many }) => ({
    stores: one(stores, {
        fields: [vendors.id],
        references: [stores.vendorId],
    }),
    createdBy: one(admin, {
        fields: [vendors.createdBy],
        references: [admin.id],
    }),
    kycDocs: many(kycDocs),
}))
