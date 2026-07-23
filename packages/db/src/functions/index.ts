import { sql, type SQL } from "drizzle-orm"

/**
 * Create a geography POINT (SRID 4326)
 * lng first, lat second (VERY IMPORTANT)
 */
export function makePoint({ lat, lng }: { lat: number; lng: number }): SQL {
    return sql`
    ST_SetSRID(
      ST_MakePoint(${lng}, ${lat}),
      4326
    )::geography
  `
}

/**
 * Distance between two geography points (meters)
 */
export function distance({ from, to }: { from: SQL; to: SQL }): SQL<number> {
    return sql<number>`
    ST_Distance(${from}, ${to})
  `
}

/**
 * Round meters to nearest integer
 */
export function roundMeters(value: SQL<number>): SQL<number> {
    return sql<number>`ROUND(${value}::numeric, 0)`
}

/**
 * Filter points within radius (meters)
 * Uses GiST index when available
 */
export function withinRadius({
    from,
    to,
    radiusMeters,
}: {
    from: SQL
    to: SQL
    radiusMeters: number
}): SQL {
    return sql`ST_DWithin(${from}, ${to}, ${radiusMeters})  `
}

/**
 * KNN nearest-neighbour ordering (FAST 🔥)
 */
export function orderByNearest({ from, to }: { from: SQL; to: SQL }): SQL {
    return sql`${from} <-> ${to}`
}
