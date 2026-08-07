import { relations } from "drizzle-orm"
import {
    boolean,
    index,
    jsonb,
    pgTable,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from "drizzle-orm/pg-core"
import { paymentProvider } from "./enums"
import { marketMandiPayment } from "./marketMandiPayment"

// Log EVERY inbound webhook before processing.
// This is the reconciliation source of truth + lets you replay safely.
export const marketMandiPaymentWebhookEvent = pgTable(
    "market_mandi_payment_webhook_event",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        provider: paymentProvider("provider").notNull(),

        // Gateway's own event id — dedupe on this, gateways redeliver webhooks
        eventId: varchar("event_id", { length: 128 }).notNull(),
        eventType: varchar("event_type", { length: 64 }).notNull(),

        paymentId: uuid("payment_id").references(() => marketMandiPayment.id, {
            onDelete: "set null",
        }),

        rawPayload: jsonb("raw_payload").notNull(),

        processed: boolean("processed").notNull().default(false),
        processedAt: timestamp("processed_at", { withTimezone: true }),

        receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        uniqueIndex("market_mandi_payment_webhook_event_unique").on(t.provider, t.eventId),
        index("market_mandi_payment_webhook_processed_idx").on(t.processed),
    ],
)

export const marketMandiPaymentWebhookEventRelations = relations(
    marketMandiPaymentWebhookEvent,
    ({ one }) => ({
        payment: one(marketMandiPayment, {
            fields: [marketMandiPaymentWebhookEvent.paymentId],
            references: [marketMandiPayment.id],
        }),
    }),
)

// Inferred types
export type MarketMandiPaymentWebhookEventInsert =
    typeof marketMandiPaymentWebhookEvent.$inferInsert
export type MarketMandiPaymentWebhookEventSelect =
    typeof marketMandiPaymentWebhookEvent.$inferSelect
