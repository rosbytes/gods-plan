import { doublePrecision, pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { timestamps } from "../common-utils/columnHelpers"
import { city } from "./city"
import { mandi } from "./mandi"
import { admin } from "./admin"

export const mandiVendor = pgTable("mandi_vendor", {
    id: uuid("id").primaryKey().defaultRandom(),
    mandi: uuid("store_id")
        .notNull()
        .references(() => mandi.id),

    fullName: varchar({ length: 255 }).notNull(),
    // phone should of length 15
    primaryPhone: varchar({ length: 20 }).unique().notNull(),
    alternatePhone: varchar({ length: 20 }),

    // mandi_vendor's latitude and longitude
    lat: doublePrecision().notNull(),
    lng: doublePrecision().notNull(),

    // image that represent the mandi
    // mandiImage: varchar({ length: 500 }),
    createdBy: uuid("created_by")
        .notNull()
        .references(() => admin.id),

    ...timestamps,
})

export const mandiVendorRelations = relations(mandiVendor, ({ one, many }) => ({
    city: one(city, {
        fields: [mandiVendor.mandi],
        references: [city.id],
    }),
    // stores: many(stores),
    // kycDocs: many(kycDocs),
    // createdBy: one(admin, {
    // fields: [vendors.createdBy],
    // references: [admin.id],
    // }),
}))
