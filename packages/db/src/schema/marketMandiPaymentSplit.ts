import { relations } from "drizzle-orm"
import { boolean, index, integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core"
import { paymentSplitType } from "./enums"
import { marketMandiPayment } from "./marketMandiPayment"

// Multi-vendor: how ONE payment divides across vendors + platform
export const marketMandiPaymentSplit = pgTable(
    "market_mandi_payment_split",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        paymentId: uuid("payment_id")
            .notNull()
            .references(() => marketMandiPayment.id, { onDelete: "cascade" }),

        splitType: paymentSplitType("split_type").notNull(),

        // Nullable: platform_commission/tax rows won't have a vendorId
        vendorId: uuid("vendor_id"),

        amount: integer("amount").notNull(),

        settled: boolean("settled").notNull().default(false),
        settledAt: timestamp("settled_at", { withTimezone: true }),

        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        index("market_mandi_payment_split_payment_id_idx").on(t.paymentId),
        index("market_mandi_payment_split_vendor_id_idx").on(t.vendorId),
        index("market_mandi_payment_split_settled_idx").on(t.settled),
    ],
)

export const marketMandiPaymentSplitRelations = relations(marketMandiPaymentSplit, ({ one }) => ({
    payment: one(marketMandiPayment, {
        fields: [marketMandiPaymentSplit.paymentId],
        references: [marketMandiPayment.id],
    }),
}))

// Inferred types
export type MarketMandiPaymentSplitInsert = typeof marketMandiPaymentSplit.$inferInsert
export type MarketMandiPaymentSplitSelect = typeof marketMandiPaymentSplit.$inferSelect
