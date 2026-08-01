import { pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { timestamps } from "../common-utils/columnHelpers"
import { admin } from "./admin"
import { mandiStore } from "./mandiStore"
import { mandiKycDoc } from "./mandiKycDoc"

export const mandiVendor = pgTable("mandi_vendor", {
    id: uuid("id").primaryKey().defaultRandom(),

    fullName: varchar("full_name", { length: 255 }).notNull(),

    // phone should of length 15
    primaryPhone: varchar("primary_phone", { length: 20 }).unique().notNull(),
    alternatePhone: varchar("alternate_phone", { length: 20 }),

    // 4 digit pin (stored as bcrypt hash)
    // TODO: default is null and that is predictable, we need to setup some random password by default
    pin: varchar({ length: 255 }),

    createdBy: uuid("created_by")
        .notNull()
        .references(() => admin.id, { onDelete: "restrict" }),

    ...timestamps,
})

export const mandiVendorRelations = relations(mandiVendor, ({ one, many }) => ({
    // stores of this vendor
    mandiStores: many(mandiStore),
    kycDocs: many(mandiKycDoc),

    // admin who created this vendor
    admin: one(admin, {
        fields: [mandiVendor.createdBy],
        references: [admin.id],
    }),
}))

// Inferred types
export type MandiVendorInsert = typeof mandiVendor.$inferInsert
export type MandiVendorSelect = typeof mandiVendor.$inferSelect
