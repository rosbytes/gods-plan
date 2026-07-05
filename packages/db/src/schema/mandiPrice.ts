import { relations } from "drizzle-orm"
import { pgTable, uuid, integer } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { mandiStore } from "./mandiStore"

export const mandiPrice = pgTable("mandi_price", {
    id: uuid("id").primaryKey().defaultRandom(),
    mandiStoreId: uuid("mandi_store_id")
        .notNull()
        .references(() => mandiStore.id),

    // price in pese not rupees
    price: integer().notNull(),

    // will timestamp help me with operation like filtering with date on timestamp column
    ...timestamps,
})

export const mandiPriceRelations = relations(mandiPrice, ({ one }) => ({
    // store to which this record belongs
    mandiStore: one(mandiStore, {
        fields: [mandiPrice.mandiStoreId],
        references: [mandiStore.id],
    }),
}))
