import { relations } from "drizzle-orm"
import {
    index,
    text,
    uniqueIndex,
    integer,
    jsonb,
    pgTable,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { paymentStatus, paymentMethod, paymentProvider } from "./enums"
import { marketMandiOrder } from "./marketMandiOrder"
import { marketMandiPaymentStatusHistory } from "./marketMandiPaymentStatusHistory"
import { marketMandiPaymentWebhookEvent } from "./marketMandiPaymentWebhookEvent"
import { marketMandiPaymentSplit } from "./marketMandiPaymentSplit"
import { mandiCounter } from "./mandiCounter"
import { admin } from "./admin"

// One row per PAYMENT ATTEMPT, not per order — supports retries & partial payments
export const marketMandiPayment = pgTable(
    "market_mandi_payment",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        orderId: uuid("order_id")
            .notNull()
            .references(() => marketMandiOrder.id, { onDelete: "restrict" }),

        // ROS Counter where physical/cash/counter-UPI payment was collected (if applicable)
        mandiCounterId: uuid("mandi_counter_id").references(() => mandiCounter.id, {
            onDelete: "set null",
        }),

        // Operator/staff member who collected payment at ROS Counter (if applicable)
        collectedByOperatorId: uuid("collected_by_operator_id").references(() => admin.id, {
            onDelete: "set null",
        }),

        // Prevents duplicate charges from double-clicks / retried webhooks.
        // Generate this client-side (or server-side) per attempt.
        idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull(),

        provider: paymentProvider("provider").notNull(),
        method: paymentMethod("method"),

        // Gateway-side identifiers — needed for webhook reconciliation
        gatewayOrderId: varchar("gateway_order_id", { length: 128 }),
        gatewayPaymentId: varchar("gateway_payment_id", { length: 128 }),

        // ALWAYS integer (smallest currency unit, paise). Never float for money.
        amount: integer("amount").notNull(),
        currency: varchar("currency", { length: 3 }).notNull().default("INR"),

        status: paymentStatus("status").notNull().default("created"),

        // Gateway fee / commission — useful at reconciliation time
        gatewayFee: integer("gateway_fee"),

        failureReason: text("failure_reason"),

        // Raw last-known gateway response for debugging without another API call
        gatewayMetadata: jsonb("gateway_metadata"),

        // Optimistic locking — avoids lost updates when webhook + user-poll
        // both try to update status around the same time
        version: integer("version").notNull().default(1),

        paidAt: timestamp("paid_at", { withTimezone: true }),

        ...timestamps,
    },
    (t) => [
        uniqueIndex("market_mandi_payment_idempotency_key_unique").on(t.idempotencyKey),
        index("market_mandi_payment_order_id_idx").on(t.orderId),
        index("market_mandi_payment_mandi_counter_id_idx").on(t.mandiCounterId),
        index("market_mandi_payment_status_idx").on(t.status),
        index("market_mandi_payment_gateway_payment_id_idx").on(t.gatewayPaymentId),
        index("market_mandi_payment_created_at_idx").on(t.createdAt),
    ],
)

export const marketMandiPaymentRelations = relations(marketMandiPayment, ({ one, many }) => ({
    order: one(marketMandiOrder, {
        fields: [marketMandiPayment.orderId],
        references: [marketMandiOrder.id],
    }),
    mandiCounter: one(mandiCounter, {
        fields: [marketMandiPayment.mandiCounterId],
        references: [mandiCounter.id],
    }),
    collectedByOperator: one(admin, {
        fields: [marketMandiPayment.collectedByOperatorId],
        references: [admin.id],
    }),
    statusHistory: many(marketMandiPaymentStatusHistory),
    webhookEvents: many(marketMandiPaymentWebhookEvent),
    splits: many(marketMandiPaymentSplit),
}))

// Inferred types
export type MarketMandiPaymentInsert = typeof marketMandiPayment.$inferInsert
export type MarketMandiPaymentSelect = typeof marketMandiPayment.$inferSelect
