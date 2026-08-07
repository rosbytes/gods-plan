import { relations } from "drizzle-orm"
import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { paymentStatus } from "./enums"
import { marketMandiPayment } from "./marketMandiPayment"

// Append-only audit trail — every status transition gets a row
export const marketMandiPaymentStatusHistory = pgTable(
    "market_mandi_payment_status_history",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        paymentId: uuid("payment_id")
            .notNull()
            .references(() => marketMandiPayment.id, { onDelete: "cascade" }),

        fromStatus: paymentStatus("from_status"),
        toStatus: paymentStatus("to_status").notNull(),

        reason: text("reason"),

        // "webhook" | "admin" | "system" | "user" — who/what triggered this
        triggeredBy: varchar("triggered_by", { length: 32 }).notNull(),

        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [index("market_mandi_payment_status_history_payment_id_idx").on(t.paymentId)],
)

export const marketMandiPaymentStatusHistoryRelations = relations(
    marketMandiPaymentStatusHistory,
    ({ one }) => ({
        payment: one(marketMandiPayment, {
            fields: [marketMandiPaymentStatusHistory.paymentId],
            references: [marketMandiPayment.id],
        }),
    }),
)

// Inferred types
export type MarketMandiPaymentStatusHistoryInsert =
    typeof marketMandiPaymentStatusHistory.$inferInsert
export type MarketMandiPaymentStatusHistorySelect =
    typeof marketMandiPaymentStatusHistory.$inferSelect
