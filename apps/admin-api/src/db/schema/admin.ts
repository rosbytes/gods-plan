import { relations } from "drizzle-orm"
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../columnHelpers"
import { vendors } from "./vendors"
import { registrationCharges } from "./registrationCharges"

export const admin = pgTable("admin", {
    id: uuid("id").primaryKey().defaultRandom(),
    // first name and last name, last could be null
    name: varchar("name", { length: 255 }).notNull(),
    // phone length, ideally should be 15
    phone: varchar({ length: 20 }).unique().notNull(),
    pin: varchar({ length: 255 }),
    ...timestamps,
})

export const adminRelations = relations(admin, ({ many }) => ({
    vendors: many(vendors),
    registrationCharges: many(registrationCharges),
}))
