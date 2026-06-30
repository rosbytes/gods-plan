import { doublePrecision, pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { timestamps } from "../common-utils/columnHelpers"
import { city } from "./city"

export const mandi = pgTable("mandi", {
    id: uuid("id").primaryKey().defaultRandom(),
    city: uuid("store_id")
        .notNull()
        .references(() => city.id),

    // mandi's latitude and longitude
    lat: doublePrecision().notNull(),
    lng: doublePrecision().notNull(),

    // image that represent the mandi
    mandiImage: varchar({ length: 500 }),
    ...timestamps,
})

export const mandiRelations = relations(mandi, ({ one, many }) => ({
    city: one(city, {
        fields: [mandi.city],
        references: [city.id],
    }),
    // stores: many(stores),
    // kycDocs: many(kycDocs),
    // createdBy: one(admin, {
    // fields: [vendors.createdBy],
    // references: [admin.id],
    // }),
}))
