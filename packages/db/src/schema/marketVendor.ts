// unstable block of code

import { integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { timestamps } from "../common-utils/columnHelpers"
import { marketStore } from "./marketStore"

export const marketVendor = pgTable("market_vendor", {
    id: uuid("id").primaryKey().defaultRandom(),

    fullName: varchar({ length: 255 }).notNull(),

    // phone should of length 15
    primaryPhone: varchar({ length: 20 }).unique().notNull(),
    alternatePhone: varchar({ length: 20 }),

    batch: integer(),

    createdBy: uuid("created_by").notNull(),
    ...timestamps,
})

export const vendorRelations = relations(marketVendor, ({ one, many }) => ({
    marketStores: many(marketStore),
}))
