import { doublePrecision, pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { timestamps } from "../common-utils/columnHelpers"
import { city } from "./city"
import { mandiVendor } from "./mandiVendor"
import { mandiStore } from "./mandiStore"
import { admin } from "./admin"

export const mandi = pgTable("mandi", {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar({ length: 255 }).notNull(),

    cityId: uuid("city_id")
        .references(() => city.id, { onDelete: "restrict" })
        .notNull(),
    createdBy: uuid("created_by")
        .references(() => admin.id, { onDelete: "restrict" })
        .notNull(),

    // mandi's latitude and longitude
    lat: doublePrecision().notNull(),
    lng: doublePrecision().notNull(),

    fullAddress: varchar("full_address", { length: 500 }),

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

    // admin who created this mandi
    admin: one(admin, {
        fields: [mandi.createdBy],
        references: [admin.id],
    }),

    // mandi vendors of this mandi
    mandiVendors: many(mandiVendor),

    // stores in this mandi
    mandiStores: many(mandiStore),
}))

// Inferred types
export type MandiInsert = typeof mandi.$inferInsert
export type MandiSelect = typeof mandi.$inferSelect
