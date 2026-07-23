import { integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { timestamps } from "../common-utils/columnHelpers"
import { marketStore } from "./marketStore"
import { admin } from "./admin"

export const marketVendor = pgTable("market_vendor", {
    id: uuid("id").primaryKey().defaultRandom(),

    fullName: varchar("full_name", { length: 255 }).notNull(),

    // phone should of length 15
    primaryPhone: varchar("primary_phone", { length: 20 }).unique().notNull(),
    alternatePhone: varchar("alternate_phone", { length: 20 }),

    // 4 digit pin (stored as bcrypt hash)
    pin: varchar({ length: 255 }),

    // slot is kind of batch, this will contain 10 vendor in a slot/batch then next slot will be assigned to new vendor,
    // and it will be probably based on sequence like first 10 vendor in slot 1 then 11 - 20 vendor in slot 2
    slot: integer(),

    createdBy: uuid("created_by")
        .notNull()
        .references(() => admin.id, { onDelete: "restrict" }),

    ...timestamps,
})

export const marketVendorRelations = relations(marketVendor, ({ one, many }) => ({
    marketStores: many(marketStore),

    // admin who created this vendor
    admin: one(admin, {
        fields: [marketVendor.createdBy],
        references: [admin.id],
    }),
}))

// Inferred types
export type MarketVendorInsert = typeof marketVendor.$inferInsert
export type MarketVendorSelect = typeof marketVendor.$inferSelect
