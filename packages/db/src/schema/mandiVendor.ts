import { doublePrecision, pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { timestamps } from "../common-utils/columnHelpers"
import { mandi } from "./mandi"
import { admin } from "./admin"
import { mandiStore } from "./mandiStore"

export const mandiVendor = pgTable("mandi_vendor", {
    id: uuid("id").primaryKey().defaultRandom(),
    mandiId: uuid("mandi_id")
        .notNull()
        .references(() => mandi.id, { onDelete: "restrict" }),

    fullName: varchar("full_name", { length: 255 }).notNull(),
    // phone should of length 15
    primaryPhone: varchar("primary_phone", { length: 20 }).unique().notNull(),
    alternatePhone: varchar("alternate_phone", { length: 20 }),

    // 4 digit pin
    pin: varchar({ length: 4 }),

    // mandi_vendor's latitude and longitude
    lat: doublePrecision().notNull(),
    lng: doublePrecision().notNull(),

    createdBy: uuid("created_by")
        .notNull()
        .references(() => admin.id, { onDelete: "restrict" }),

    ...timestamps,
})

export const mandiVendorRelations = relations(mandiVendor, ({ one, many }) => ({
    // stores of this vendor
    mandiStores: many(mandiStore),

    // mandi of this vendor
    mandi: one(mandi, {
        fields: [mandiVendor.mandiId],
        references: [mandi.id],
    }),

    // admin who created this vendor
    admin: one(admin, {
        fields: [mandiVendor.createdBy],
        references: [admin.id],
    }),
}))

// Inferred types
export type MandiVendorInsert = typeof mandiVendor.$inferInsert
export type MandiVendorSelect = typeof mandiVendor.$inferSelect
