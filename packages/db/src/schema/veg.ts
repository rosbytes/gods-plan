import { pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { timestamps } from "../common-utils/columnHelpers"
import { mandiStore } from "./mandiStore"
import { mandiPrice } from "./mandiPrice"
import { admin } from "./admin"

export const veg = pgTable("veg", {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar({ length: 500 }).notNull().unique(),
    nameInHindi: varchar("name_in_hindi", { length: 255 }),

    // image that represent the veg
    vegPrimaryImage: varchar("veg_primary_image", { length: 500 }),
    // TODO: apply max length of array
    vegImageGallery: varchar("veg_image_gallery", { length: 500 }).array(),

    createdBy: uuid("created_by").references(() => admin.id, { onDelete: "set null" }),

    ...timestamps,
})

export const vegRelations = relations(veg, ({ one, many }) => ({
    // stores selling this veg
    mandiStores: many(mandiStore),

    // price records for this veg
    mandiPrices: many(mandiPrice),

    // admin who created this veg entry
    admin: one(admin, {
        fields: [veg.createdBy],
        references: [admin.id],
    }),
}))

// Inferred types
export type VegInsert = typeof veg.$inferInsert
export type VegSelect = typeof veg.$inferSelect
