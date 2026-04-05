import { relations } from "drizzle-orm"
import { pgTable, uuid, integer, doublePrecision, varchar, customType } from "drizzle-orm/pg-core"
import { timestamps } from "../columnHelpers"
import { vendors } from "./vendors"

// Type-safe Point interface for geographic coordinates
export interface Point {
    lat: number
    lng: number
}

const geography = customType<{ data: Point; driverData: string }>({
    dataType() {
        return "geography(point, 4326)"
    },
})

export const stores = pgTable(
    "stores",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        vendorId: uuid("vendor_id")
            .notNull()
            .references(() => vendors.id),
        lat: doublePrecision().notNull(),
        lng: doublePrecision().notNull(),

        // some thing wrong with geometry, should use GEOGRAPHY(Point, 4326), ac to gpt
        geography: geography("geography").notNull(),
        // default serving radius in km
        radiusKm: integer("radius_km").default(4),
        fullAddress: varchar("full_address", { length: 500 }).notNull(),

        storeName: varchar({ length: 255 }),
        storeImage: varchar({ length: 500 }),
        ...timestamps,
    },
    (t) => [
        // PostGIS index (GiST)
        // geomIndex: index("idx_restaurants_geom").using("gist", t.geography),
    ],
)

export const storesRelations = relations(stores, ({ one }) => ({
    vendor: one(vendors, {
        fields: [stores.vendorId],
        references: [vendors.id],
    }),
}))
