import { relations } from "drizzle-orm"
import {
    boolean,
    doublePrecision,
    index,
    pgTable,
    uniqueIndex,
    uuid,
    varchar,
} from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { mandi } from "./mandi"
import { admin } from "./admin"

// Physical / Virtual ROS Counter at a Mandi for Payment Collection & Pickup Verification
export const mandiCounter = pgTable(
    "mandi_counter",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // Mandi where this ROS counter is located
        mandiId: uuid("mandi_id")
            .notNull()
            .references(() => mandi.id, { onDelete: "restrict" }),

        counterName: varchar("counter_name", { length: 255 }).notNull(),
        counterCode: varchar("counter_code", { length: 32 }).notNull().unique(),

        // Staff / operator assigned to handle this ROS counter
        operatorId: uuid("operator_id").references(() => admin.id, { onDelete: "set null" }),

        // mandiCounter's latitude and longitude
        lat: doublePrecision().notNull(),
        lng: doublePrecision().notNull(),

        fullAddress: varchar("full_address", { length: 500 }),

        // image that represents the mandiCounter
        mandiCounterImage: varchar("mandi_counter_image", { length: 500 }),

        isActive: boolean("is_active").notNull().default(true),

        ...timestamps,
    },
    (t) => [
        uniqueIndex("mandi_counter_code_unique").on(t.counterCode),
        index("mandi_counter_mandi_id_idx").on(t.mandiId),
        index("mandi_counter_operator_id_idx").on(t.operatorId),
        index("mandi_counter_is_active_idx").on(t.isActive),
    ],
)

export const mandiCounterRelations = relations(mandiCounter, ({ one }) => ({
    mandi: one(mandi, {
        fields: [mandiCounter.mandiId],
        references: [mandi.id],
    }),
    operator: one(admin, {
        fields: [mandiCounter.operatorId],
        references: [admin.id],
    }),
}))

// Inferred types
export type MandiCounterInsert = typeof mandiCounter.$inferInsert
export type MandiCounterSelect = typeof mandiCounter.$inferSelect
