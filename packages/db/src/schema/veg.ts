import { pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { timestamps } from "../common-utils/columnHelpers"

export const veg = pgTable("veg", {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar({ length: 500 }).notNull(),
    nameInHindi: varchar({ length: 255 }),

    // image that represent the veg
    vegPrimaryImage: varchar({ length: 500 }),
    // TODO: apply max length of array
    vegImageGalley: varchar({ length: 500 }).array(),
    ...timestamps,
})

export const vegRelations = relations(veg, ({ one, many }) => ({
    // city: one(city, {
    //     fields: [veg.city],
    //     references: [city.id],
    // }),
    // stores: many(stores),
    // kycDocs: many(kycDocs),
    // createdBy: one(admin, {
    // fields: [vendors.createdBy],
    // references: [admin.id],
    // }),
}))
