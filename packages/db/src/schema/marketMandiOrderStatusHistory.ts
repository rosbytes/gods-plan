import { relations } from "drizzle-orm"
import { pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { marketMandiOrder } from "./marketMandiOrder"
import { orderStatusEnum } from "../common-utils/enums"

export const marketMandiOrderStatus = pgEnum("market_mandi_order_status", orderStatusEnum)

export const marketMandiOrderStatusHistory = pgTable("market_mandi_order_status_history", {
    id: uuid("id").primaryKey().defaultRandom(),

    orderId: uuid("order_id")
        .references(() => marketMandiOrder.id, { onDelete: "cascade" })
        .notNull(),

    status: marketMandiOrderStatus("status").notNull(),

    // who changed it — could be a mandi store admin, market store admin, or system/cron
    changedByType: varchar("changed_by_type", { length: 32 }).notNull(), // "market_store" | "mandi_store" | "system" | "admin"
    changedById: uuid("changed_by_id"), // nullable — system transitions have no actor

    note: varchar("note", { length: 500 }), // optional: "rejected — out of stock"

    ...timestamps,
})

export const marketMandiOrderStatusHistoryRelations = relations(
    marketMandiOrderStatusHistory,
    ({ one }) => ({
        order: one(marketMandiOrder, {
            fields: [marketMandiOrderStatusHistory.orderId],
            references: [marketMandiOrder.id],
        }),
    }),
)

// Inferred types
export type MarketMandiOrderStatusHistoryInsert = typeof marketMandiOrderStatusHistory.$inferInsert
export type MarketMandiOrderStatusHistorySelect = typeof marketMandiOrderStatusHistory.$inferSelect
