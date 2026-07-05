import { relations } from "drizzle-orm"
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { mandi } from "./mandi"
import { admin } from "./admin"

export const city = pgTable("city", {
    id: uuid("id").primaryKey().defaultRandom(),
    city: varchar({ length: 255 }).notNull(),

    // image that represent the city
    cityImage: varchar("city_image", { length: 500 }),
    createdBy: uuid("created_by").references(() => admin.id),
    ...timestamps,
})

export const cityRelations = relations(city, ({ one, many }) => ({
    mandi: many(mandi),

    // this city is created by which admin
    admin: one(admin, {
        fields: [city.createdBy],
        references: [admin.id],
    }),
}))
