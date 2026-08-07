import { relations } from "drizzle-orm"
import { index, integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { veg } from "./veg"
import { mandiStore } from "./mandiStore"
import { marketMandiOrder } from "./marketMandiOrder"
import { orderStatus } from "./enums"

// Order line items — vegetable snapshot, price, mandi store & fulfillment status
export const marketMandiOrderItem = pgTable(
    "market_mandi_order_item",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        orderId: uuid("order_id")
            .notNull()
            .references(() => marketMandiOrder.id, { onDelete: "cascade" }),

        // Mandi store supplying this specific vegetable
        mandiStoreId: uuid("mandi_store_id")
            .notNull()
            .references(() => mandiStore.id, { onDelete: "restrict" }),

        // FK to veg for lookups/analytics, but always read price/name snapshots for history
        vegId: uuid("veg_id")
            .notNull()
            .references(() => veg.id, { onDelete: "restrict" }),

        // Snapshots frozen at purchase time
        vegNameSnapshot: varchar("veg_name_snapshot", { length: 255 }).notNull(),
        mandiStoreNameSnapshot: varchar("mandi_store_name_snapshot", { length: 255 }).notNull(),

        quantityInGram: integer("quantity_in_gram").notNull(),
        pricePerKg: integer("price_per_kg").notNull(),
        totalAmount: integer("total_amount").notNull(),

        // Fulfillment status for this individual line item by Mandi Store
        status: orderStatus("status").notNull().default("pending"),

        ...timestamps,
    },
    (t) => [
        index("market_mandi_order_item_order_id_idx").on(t.orderId),
        index("market_mandi_order_item_mandi_store_id_idx").on(t.mandiStoreId),
        index("market_mandi_order_item_veg_id_idx").on(t.vegId),
        index("market_mandi_order_item_status_idx").on(t.status),
    ],
)

export const marketMandiOrderItemRelations = relations(marketMandiOrderItem, ({ one }) => ({
    order: one(marketMandiOrder, {
        fields: [marketMandiOrderItem.orderId],
        references: [marketMandiOrder.id],
    }),
    mandiStore: one(mandiStore, {
        fields: [marketMandiOrderItem.mandiStoreId],
        references: [mandiStore.id],
    }),
    veg: one(veg, {
        fields: [marketMandiOrderItem.vegId],
        references: [veg.id],
    }),
}))

// Inferred types
export type MarketMandiOrderItemInsert = typeof marketMandiOrderItem.$inferInsert
export type MarketMandiOrderItemSelect = typeof marketMandiOrderItem.$inferSelect
