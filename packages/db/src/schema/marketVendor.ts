// unstable block of code

import { pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { timestamps } from "../common-utils/columnHelpers"

export const marketVendor = pgTable("market_vendor", {
    // id: uuid("id").primaryKey().defaultRandom(),
    // fullName: varchar({ length: 255 }).notNull(),
    // // phone should of length 15
    // primaryPhone: varchar({ length: 20 }).unique().notNull(),
    // alternatePhone: varchar({ length: 20 }),
    // // type of vendor

    // createdBy: uuid("created_by").notNull(),
    ...timestamps,
})

export const vendorRelations = relations(marketVendor, ({ one, many }) => ({
    // stores: many(stores),
    // kycDocs: many(kycDocs),
    // createdBy: one(admin, {
    // fields: [vendors.createdBy],
    // references: [admin.id],
    // }),
}))
