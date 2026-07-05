import { relations } from "drizzle-orm"
import { pgTable, uuid, integer } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { mandiStore } from "./mandiStore"
import { veg } from "./veg"

export const mandiPrice = pgTable("mandi_price", {
    id: uuid("id").primaryKey().defaultRandom(),

    mandiStoreId: uuid("mandi_store_id")
        .notNull()
        .references(() => mandiStore.id, { onDelete: "cascade" }),

    vegId: uuid("veg_id")
        .notNull()
        .references(() => veg.id, { onDelete: "restrict" }),

    // price in paise not rupees
    price: integer().notNull(),

    // TODO: will timestamp help me with operation like filtering with date on timestamp column
    ...timestamps,
})

export const mandiPriceRelations = relations(mandiPrice, ({ one }) => ({
    // store to which this record belongs
    mandiStore: one(mandiStore, {
        fields: [mandiPrice.mandiStoreId],
        references: [mandiStore.id],
    }),

    // veg this price is for
    veg: one(veg, {
        fields: [mandiPrice.vegId],
        references: [veg.id],
    }),
}))

// Inferred types
export type MandiPriceInsert = typeof mandiPrice.$inferInsert
export type MandiPriceSelect = typeof mandiPrice.$inferSelect
