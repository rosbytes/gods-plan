import { relations } from "drizzle-orm"
import { boolean, index, integer, pgTable, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { marketVendor } from "./marketVendor"
import { marketVendorWalletTransaction } from "./marketVendorWalletTransaction"

// Digital Wallet Account for Market Vendor
export const marketVendorWallet = pgTable(
    "market_vendor_wallet",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // 1:1 relationship with Market Vendor
        vendorId: uuid("vendor_id")
            .notNull()
            .references(() => marketVendor.id, { onDelete: "cascade" }),

        // Balance in paise (integer)
        balance: integer("balance").notNull().default(0),

        // Held / frozen funds for pending orders
        frozenBalance: integer("frozen_balance").notNull().default(0),

        currency: varchar("currency", { length: 3 }).notNull().default("INR"),

        isActive: boolean("is_active").notNull().default(true),

        ...timestamps,
    },
    (t) => [
        uniqueIndex("market_vendor_wallet_vendor_id_unique").on(t.vendorId),
        index("market_vendor_wallet_is_active_idx").on(t.isActive),
    ],
)

export const marketVendorWalletRelations = relations(marketVendorWallet, ({ one, many }) => ({
    vendor: one(marketVendor, {
        fields: [marketVendorWallet.vendorId],
        references: [marketVendor.id],
    }),
    transactions: many(marketVendorWalletTransaction),
}))

// Inferred types
export type MarketVendorWalletInsert = typeof marketVendorWallet.$inferInsert
export type MarketVendorWalletSelect = typeof marketVendorWallet.$inferSelect
