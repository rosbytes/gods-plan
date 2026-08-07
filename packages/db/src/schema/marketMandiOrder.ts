import { relations } from "drizzle-orm"
import {
    doublePrecision,
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { marketStore } from "./marketStore"
import { fulfillmentType, orderStatus } from "./enums"
import { marketMandiOrderItem } from "./marketMandiOrderItem"
import { marketMandiPayment } from "./marketMandiPayment"
import { marketMandiOrderStatusHistory } from "./marketMandiOrderStatusHistory"
import { mandiCounter } from "./mandiCounter"

// Checkout Header Order — 1 row per checkout placed by a Market Store
export const marketMandiOrder = pgTable(
    "market_mandi_order",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // Human-readable order reference, e.g. ORD-2026-000123
        orderCode: varchar("order_code", { length: 32 }).notNull().unique(),

        // The market store placing this order
        marketStoreId: uuid("market_store_id")
            .references(() => marketStore.id, { onDelete: "set null" })
            .notNull(),

        // Store snapshot at time of order
        marketStoreName: varchar("market_store_name", { length: 255 }).notNull(),

        // Prevents duplicate orders from double-submitted checkouts
        idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull(),

        // Overall order header status
        status: orderStatus("status").notNull().default("pending"),

        // Fulfillment mode — "delivery" or "self_pickup"
        fulfillmentType: fulfillmentType("fulfillment_type").notNull().default("delivery"),

        // ROS Counter for self-pickup / payment verification
        mandiCounterId: uuid("mandi_counter_id").references(() => mandiCounter.id, {
            onDelete: "set null",
        }),

        // Verification code shown to ROS Counter / Mandi vendor for self-pickup
        pickupCode: varchar("pickup_code", { length: 16 }),

        // Recorded when payment is collected / verified at ROS Counter
        counterPaidAt: timestamp("counter_paid_at", { withTimezone: true }),

        // Money in paise (integers)
        subtotal: integer("subtotal").notNull(),
        tax: integer("tax").notNull().default(0),
        deliveryFee: integer("delivery_fee").notNull().default(0),
        discount: integer("discount").notNull().default(0),
        totalAmount: integer("total_amount").notNull(),

        // Delivery address snapshot
        deliveryAddressLine1: text("delivery_address_line1"),
        deliveryAddressLine2: text("delivery_address_line2"),
        deliveryCity: varchar("delivery_city", { length: 100 }),
        deliveryState: varchar("delivery_state", { length: 100 }),
        deliveryPincode: varchar("delivery_pincode", { length: 10 }),
        deliveryLat: doublePrecision("delivery_lat"),
        deliveryLng: doublePrecision("delivery_lng"),

        cancellationReason: text("cancellation_reason"),

        // Optimistic locking for updates
        version: integer("version").notNull().default(1),

        placedAt: timestamp("placed_at", { withTimezone: true }).notNull().defaultNow(),
        confirmedAt: timestamp("confirmed_at", { withTimezone: true }),

        ...timestamps,
    },
    (t) => [
        uniqueIndex("market_mandi_order_order_code_unique").on(t.orderCode),
        uniqueIndex("market_mandi_order_idempotency_key_unique").on(t.idempotencyKey),
        index("market_mandi_order_market_store_id_idx").on(t.marketStoreId),
        index("market_mandi_order_mandi_counter_id_idx").on(t.mandiCounterId),
        index("market_mandi_order_status_idx").on(t.status),
        index("market_mandi_order_fulfillment_type_idx").on(t.fulfillmentType),
        index("market_mandi_order_placed_at_idx").on(t.placedAt),
    ],
)

export const marketMandiOrderRelations = relations(marketMandiOrder, ({ one, many }) => ({
    marketStore: one(marketStore, {
        fields: [marketMandiOrder.marketStoreId],
        references: [marketStore.id],
    }),
    mandiCounter: one(mandiCounter, {
        fields: [marketMandiOrder.mandiCounterId],
        references: [mandiCounter.id],
    }),
    items: many(marketMandiOrderItem),
    payments: many(marketMandiPayment),
    statusHistory: many(marketMandiOrderStatusHistory),
}))

// Inferred types
export type MarketMandiOrderInsert = typeof marketMandiOrder.$inferInsert
export type MarketMandiOrderSelect = typeof marketMandiOrder.$inferSelect
