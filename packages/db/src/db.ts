import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { env } from "./configs"
import * as adminSchema from "./schema/admin"
import * as citySchema from "./schema/city"
import * as mandiSchema from "./schema/mandi"
import * as mandiPriceSchema from "./schema/mandiPrice"
import * as mandiStoreSchema from "./schema/mandiStore"
import * as mandiVendorSchema from "./schema/mandiVendor"
import * as marketMandiOrderSchema from "./schema/marketMandiOrder"
import * as marketMandiOrderStatusHistorySchema from "./schema/marketMandiOrderStatusHistory"
import * as marketStoreSchema from "./schema/marketStore"
import * as marketVendorSchema from "./schema/marketVendor"
import * as marketMandiOrderPaymentSchema from "./schema/marketMandiOrderPayment"
import * as vegSchema from "./schema/veg"
import * as marketKycDocSchema from "./schema/marketKycDoc"
import * as mandiKycDocSchema from "./schema/mandiKycDoc"
import * as marketSubscriptionChargesSchema from "./schema/marketSubscriptionCharges"
import * as mandiSubscriptionChargesSchema from "./schema/mandiSubscriptionCharges"

const client = postgres(env.DATABASE_URL)

/** Call once at app startup to verify DB connectivity */
export async function testConnection() {
    try {
        await client`SELECT 1`
        console.log("DB connected")
    } catch (error) {
        console.error("DB connection failed:", error)
        throw error
    }
}

export const db = drizzle(client, {
    schema: {
        ...adminSchema,
        ...citySchema,
        ...mandiSchema,
        ...mandiPriceSchema,
        ...mandiStoreSchema,
        ...mandiVendorSchema,
        ...marketMandiOrderSchema,
        ...marketMandiOrderStatusHistorySchema,
        ...marketStoreSchema,
        ...marketVendorSchema,
        ...marketMandiOrderPaymentSchema,
        ...vegSchema,
        ...marketKycDocSchema,
        ...mandiKycDocSchema,
        ...marketSubscriptionChargesSchema,
        ...mandiSubscriptionChargesSchema,
    },
    casing: "snake_case",
})
