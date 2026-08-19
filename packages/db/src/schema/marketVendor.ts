import { boolean, pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { timestamps } from "../common-utils/columnHelpers"
import { marketStore } from "./marketStore"
import { marketKycDoc } from "./marketKycDoc"
import { admin } from "./admin"
import { marketVendorWallet } from "./marketVendorWallet"
import { marketVendorWalletTransaction } from "./marketVendorWalletTransaction"

export const marketVendor = pgTable("market_vendor", {
    id: uuid("id").primaryKey().defaultRandom(),

    fullName: varchar("full_name", { length: 255 }).notNull(),

    // phone should of length 15
    primaryPhone: varchar("primary_phone", { length: 20 }).unique().notNull(),
    alternatePhone: varchar("alternate_phone", { length: 20 }),

    // 4 digit pin (stored as bcrypt hash)
    pin: varchar({ length: 255 }),

    createdBy: uuid("created_by")
        .notNull()
        .references(() => admin.id, { onDelete: "restrict" }),

    isActive: boolean("is_active").default(false).notNull(),

    // approved by admin (by default not approved)
    isApproved: boolean("is_approved").default(false).notNull(),

    ...timestamps,
})

export const marketVendorRelations = relations(marketVendor, ({ one, many }) => ({
    marketStores: many(marketStore),
    kycDocs: many(marketKycDoc),
    wallet: one(marketVendorWallet),
    walletTransactions: many(marketVendorWalletTransaction),

    // admin who created this vendor
    admin: one(admin, {
        fields: [marketVendor.createdBy],
        references: [admin.id],
    }),
}))

// Inferred types
export type MarketVendorInsert = typeof marketVendor.$inferInsert
export type MarketVendorSelect = typeof marketVendor.$inferSelect
