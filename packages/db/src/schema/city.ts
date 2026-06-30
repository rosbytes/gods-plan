import { relations } from "drizzle-orm"
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { mandi } from "./mandi"

export const city = pgTable("city", {
    id: uuid("id").primaryKey().defaultRandom(),
    city: varchar({ length: 255 }).notNull(),
    // image that represent the city
    cityImage: varchar({ length: 500 }),
    ...timestamps,
})

export const cityRelations = relations(city, ({ one, many }) => ({
    mandi: many(mandi),

    // stores: many(stores),
    // kycDocs: many(kycDocs),
    // createdBy: one(admin, {
    // fields: [vendors.createdBy],
    // references: [admin.id],
    // }),
}))
