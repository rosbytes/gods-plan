import { relations } from "drizzle-orm"
import { index, integer, jsonb, pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { marketVendor } from "./marketVendor"
import { marketVendorWallet } from "./marketVendorWallet"
import {
    walletTransactionCategory,
    walletTransactionStatus,
    transactionType,
    walletReferenceType,
} from "./enums"

// Append-only wallet transaction ledger
export const marketVendorWalletTransaction = pgTable(
    "market_vendor_wallet_transaction",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        walletId: uuid("wallet_id")
            .notNull()
            .references(() => marketVendorWallet.id, { onDelete: "cascade" }),

        vendorId: uuid("vendor_id")
            .notNull()
            .references(() => marketVendor.id, { onDelete: "cascade" }),

        // Transaction amount in paise (positive for credit, negative for debit)
        amount: integer("amount").notNull(),

        type: transactionType("type").notNull(),
        category: walletTransactionCategory("category").notNull(),
        status: walletTransactionStatus("status").notNull().default("success"),

        // Source / Cause of transaction — "order" | "payment" | "admin" | "gateway"
        referenceType: walletReferenceType("reference_type"),
        referenceId: varchar("reference_id", { length: 255 }),

        // Historical balance audit
        balanceBefore: integer("balance_before"),
        balanceAfter: integer("balance_after"),

        description: varchar("description", { length: 500 }),
        metadata: jsonb("metadata"),

        ...timestamps,
    },
    (t) => [
        index("market_vendor_wallet_tx_wallet_id_idx").on(t.walletId),
        index("market_vendor_wallet_tx_vendor_id_idx").on(t.vendorId),
        index("market_vendor_wallet_tx_type_idx").on(t.type),
        index("market_vendor_wallet_tx_category_idx").on(t.category),
        index("market_vendor_wallet_tx_created_at_idx").on(t.createdAt),
    ],
)

export const marketVendorWalletTransactionRelations = relations(
    marketVendorWalletTransaction,
    ({ one }) => ({
        wallet: one(marketVendorWallet, {
            fields: [marketVendorWalletTransaction.walletId],
            references: [marketVendorWallet.id],
        }),
        vendor: one(marketVendor, {
            fields: [marketVendorWalletTransaction.vendorId],
            references: [marketVendor.id],
        }),
    }),
)

// Inferred types
export type MarketVendorWalletTransactionInsert = typeof marketVendorWalletTransaction.$inferInsert
export type MarketVendorWalletTransactionSelect = typeof marketVendorWalletTransaction.$inferSelect
