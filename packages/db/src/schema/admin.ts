import { relations } from "drizzle-orm"
import { boolean, pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { adminRoleEnum } from "../common-utils/enums"
import { city } from "./city"
import { mandi } from "./mandi"
import { mandiVendor } from "./mandiVendor"
import { marketVendor } from "./marketVendor"
import { veg } from "./veg"

export const adminRole = pgEnum("admin_role", adminRoleEnum)

export const admin = pgTable("admin", {
    id: uuid("id").primaryKey().defaultRandom(),
    // first name and last name, last could be null
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar({ length: 255 }).unique(),
    // phone length, ideally should be 15
    phone: varchar({ length: 20 }).unique().notNull(),
    // 4 digit pin (stored as bcrypt hash)
    pin: varchar({ length: 255 }),

    role: adminRole("role").notNull().default("admin"),
    isActive: boolean("is_active").notNull().default(true),

    ...timestamps,
})

export const adminRelations = relations(admin, ({ many }) => ({
    // cities created by this admin
    cities: many(city),
    // mandis created by this admin
    mandis: many(mandi),
    // mandiVendors created by this admin
    mandiVendors: many(mandiVendor),
    // marketVendors created by this admin
    marketVendors: many(marketVendor),
    // vegs created by this admin
    vegs: many(veg),
}))

// Inferred types
export type AdminInsert = typeof admin.$inferInsert
export type AdminSelect = typeof admin.$inferSelect
