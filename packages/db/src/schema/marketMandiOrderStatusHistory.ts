import { relations } from "drizzle-orm"
import { index, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { marketMandiOrder } from "./marketMandiOrder"
import { marketMandiOrderItem } from "./marketMandiOrderItem"
import { orderStatus } from "./enums"

// Append-only status transition history for orders / order items
export const marketMandiOrderStatusHistory = pgTable(
    "market_mandi_order_status_history",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        orderId: uuid("order_id")
            .references(() => marketMandiOrder.id, { onDelete: "cascade" })
            .notNull(),

        // Optional item reference if transition is for a specific line item
        orderItemId: uuid("order_item_id").references(() => marketMandiOrderItem.id, {
            onDelete: "cascade",
        }),

        fromStatus: orderStatus("from_status"),
        toStatus: orderStatus("to_status").notNull(),

        reason: text("reason"),

        // Who/what triggered this — "system" | "market_store" | "mandi_store" | "admin"
        triggeredBy: varchar("triggered_by", { length: 32 }).notNull(),
        changedById: uuid("changed_by_id"), // Optional actor UUID

        ...timestamps,
    },
    (t) => [
        index("market_mandi_order_status_history_order_id_idx").on(t.orderId),
        index("market_mandi_order_status_history_order_item_id_idx").on(t.orderItemId),
    ],
)

export const marketMandiOrderStatusHistoryRelations = relations(
    marketMandiOrderStatusHistory,
    ({ one }) => ({
        order: one(marketMandiOrder, {
            fields: [marketMandiOrderStatusHistory.orderId],
            references: [marketMandiOrder.id],
        }),
        orderItem: one(marketMandiOrderItem, {
            fields: [marketMandiOrderStatusHistory.orderItemId],
            references: [marketMandiOrderItem.id],
        }),
    }),
)

// Inferred types
export type MarketMandiOrderStatusHistoryInsert = typeof marketMandiOrderStatusHistory.$inferInsert
export type MarketMandiOrderStatusHistorySelect = typeof marketMandiOrderStatusHistory.$inferSelect
