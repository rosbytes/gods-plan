import { doublePrecision, pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { timestamps } from "../common-utils/columnHelpers"
import { city } from "./city"
import { mandiVendor } from "./mandiVendor"
import { mandiStore } from "./mandiStore"
import { admin } from "./admin"

export const mandi = pgTable("mandi", {
    id: uuid("id").primaryKey().defaultRandom(),

    cityId: uuid("city_id")
        .references(() => city.id)
        .notNull(),
    createdBy: uuid("created_by")
        .references(() => admin.id)
        .notNull(),

    // mandi's latitude and longitude
    lat: doublePrecision().notNull(),
    lng: doublePrecision().notNull(),

    // image that represent the mandi
    mandiImage: varchar("mandi_image", { length: 500 }),
    ...timestamps,
})

export const mandiRelations = relations(mandi, ({ one, many }) => ({
    // in which city this mandi is
    city: one(city, {
        fields: [mandi.cityId],
        references: [city.id],
    }),
    // mandi vendors of this mandi
    mandiVendor: many(mandiVendor),

    // stores: many(stores),
    // kycDocs: many(kycDocs),
    // createdBy: one(admin, {
    // fields: [vendors.createdBy],
    // references: [admin.id],
    // }),
}))
