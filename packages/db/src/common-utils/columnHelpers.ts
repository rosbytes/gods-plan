// import { sql } from "drizzle-orm"
import { sql } from "drizzle-orm"
import { timestamp } from "drizzle-orm/pg-core"

export const timestamps = {
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        // .$onUpdate(() => new Date())
        .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
        .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
}
