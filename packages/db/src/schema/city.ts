import { relations } from "drizzle-orm"
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { mandi } from "./mandi"
import { admin } from "./admin"

export const city = pgTable("city", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    state: varchar({ length: 255 }).notNull(),
    pincode: varchar({ length: 10 }),

    // image that represent the city
    cityImage: varchar("city_image", { length: 500 }),
    createdBy: uuid("created_by").references(() => admin.id, { onDelete: "set null" }),
    ...timestamps,
})

export const cityRelations = relations(city, ({ one, many }) => ({
    mandis: many(mandi),

    // this city is created by which admin
    admin: one(admin, {
        fields: [city.createdBy],
        references: [admin.id],
    }),
}))

// Inferred types
export type CityInsert = typeof city.$inferInsert
export type CitySelect = typeof city.$inferSelect
