import { relations } from "drizzle-orm"
import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { marketStore } from "./marketStore"
import { mandiStore } from "./mandiStore"
import { veg } from "./veg"
import { marketMandiOrderStatus } from "../common-utils/enums"

// Market Place the order on Mandi
export const marketMandiOrder = pgTable("market_mandi_order", {
    id: uuid("id").primaryKey().defaultRandom(),

    // human-readable order reference, e.g. ORD-2026-000123
    orderCode: varchar("order_code", { length: 32 }).notNull().unique(),

    // stores reference
    marketStoreId: uuid("market_store_id")
        .references(() => marketStore.id)
        .notNull(),

    mandiStoreId: uuid("mandi_store_id")
        .references(() => mandiStore.id)
        .notNull(),

    // vegie reference
    vegId: uuid("veg_id")
        .references(() => veg.id)
        .notNull(),

    // snapshots (store names/product names can change later — freeze them here)
    mandiStoreName: varchar("mandi_store_name", { length: 255 }).notNull(),
    marketStoreName: varchar("market_store_name", { length: 255 }).notNull(),
    vegName: varchar("veg_name", { length: 255 }).notNull(),

    // quantity
    quantityInGram: integer("quantity_in_gram").notNull(),

    // price + total snapshots, always in paise (integers, never float)
    pricePerKgInPaise: integer("price_per_kg_in_paise").notNull(),
    totalAmountInPaise: integer("total_amount_in_paise").notNull(),

    // order lifecycle
    status: marketMandiOrderStatus("status").notNull().default("pending"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }), // see note below

    ...timestamps,
})

export const marketMandiOrderRelations = relations(marketMandiOrder, ({ one }) => ({
    marketStore: one(marketStore, {
        fields: [marketMandiOrder.marketStoreId],
        references: [marketStore.id],
    }),
    mandiStore: one(mandiStore, {
        fields: [marketMandiOrder.mandiStoreId],
        references: [mandiStore.id],
    }),
    veg: one(veg, {
        fields: [marketMandiOrder.vegId],
        references: [veg.id],
    }),
}))
