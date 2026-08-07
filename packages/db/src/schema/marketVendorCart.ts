import { relations } from "drizzle-orm"
import { integer, pgTable, uuid, unique } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { marketStore } from "./marketStore"
import { mandiStore } from "./mandiStore"
import { veg } from "./veg"

export const marketVendorCart = pgTable(
    "market_vendor_cart",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // the market store adding items to cart
        marketStoreId: uuid("market_store_id")
            .references(() => marketStore.id, { onDelete: "cascade" })
            .notNull(),

        // the mandi store being ordered from
        mandiStoreId: uuid("mandi_store_id")
            .references(() => mandiStore.id, { onDelete: "cascade" })
            .notNull(),

        // vegetable being added
        vegId: uuid("veg_id")
            .references(() => veg.id, { onDelete: "restrict" })
            .notNull(),

        // desired quantity — price is fetched live from mandiPrice at checkout
        quantityInGram: integer("quantity_in_gram").notNull(),

        ...timestamps,
    },
    (t) => [
        // one cart row per veg per mandi store per market store
        unique("market_vendor_cart_unique").on(t.marketStoreId, t.mandiStoreId, t.vegId),
    ],
)

export const marketVendorCartRelations = relations(marketVendorCart, ({ one }) => ({
    marketStore: one(marketStore, {
        fields: [marketVendorCart.marketStoreId],
        references: [marketStore.id],
    }),
    mandiStore: one(mandiStore, {
        fields: [marketVendorCart.mandiStoreId],
        references: [mandiStore.id],
    }),
    veg: one(veg, {
        fields: [marketVendorCart.vegId],
        references: [veg.id],
    }),
}))

// Inferred types
export type MarketVendorCartInsert = typeof marketVendorCart.$inferInsert
export type MarketVendorCartSelect = typeof marketVendorCart.$inferSelect
