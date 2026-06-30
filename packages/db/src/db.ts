import "dotenv/config"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as adminSchema from "./schema/admin"
import * as citySchema from "./schema/city"
import * as mandiSchema from "./schema/mandi"
import * as mandiStoreSchema from "./schema/mandiStore"
import * as mandiVendorSchema from "./schema/mandiVendor"
import * as marketVendorSchema from "./schema/marketVendor"
import * as vegSchema from "./schema/veg"

// TODO: create a pool
const client = postgres(process.env.DATABASE_URL!)
client`SELECT 1`.then(() => console.log("DB connected")).catch(console.error)
export const db = drizzle(client, {
    schema: {
        ...adminSchema,
        ...citySchema,
        ...mandiSchema,
        ...mandiStoreSchema,
        ...mandiVendorSchema,
        ...marketVendorSchema,
        ...vegSchema,
    },
    casing: "snake_case",
})
