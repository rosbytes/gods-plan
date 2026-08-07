import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { env } from "./configs"
import * as adminSchema from "./schema/admin"
import * as citySchema from "./schema/city"
import * as mandiSchema from "./schema/mandi"
import * as mandiCounterSchema from "./schema/mandiCounter"
import * as mandiPriceSchema from "./schema/mandiPrice"
import * as mandiStoreSchema from "./schema/mandiStore"
import * as mandiVendorSchema from "./schema/mandiVendor"
import * as marketMandiOrderSchema from "./schema/marketMandiOrder"
import * as marketMandiOrderItemSchema from "./schema/marketMandiOrderItem"
import * as marketMandiOrderStatusHistorySchema from "./schema/marketMandiOrderStatusHistory"
import * as marketStoreSchema from "./schema/marketStore"
import * as marketVendorSchema from "./schema/marketVendor"
import * as marketVendorWalletSchema from "./schema/marketVendorWallet"
import * as marketVendorWalletTransactionSchema from "./schema/marketVendorWalletTransaction"
import * as marketMandiPaymentSchema from "./schema/marketMandiPayment"
import * as marketMandiPaymentStatusHistorySchema from "./schema/marketMandiPaymentStatusHistory"
import * as marketMandiPaymentWebhookEventSchema from "./schema/marketMandiPaymentWebhookEvent"
import * as marketMandiPaymentSplitSchema from "./schema/marketMandiPaymentSplit"
import * as marketVendorCartSchema from "./schema/marketVendorCart"
import * as vegSchema from "./schema/veg"
import * as marketKycDocSchema from "./schema/marketKycDoc"
import * as mandiKycDocSchema from "./schema/mandiKycDoc"
import * as marketSubscriptionChargesSchema from "./schema/marketSubscriptionCharges"
import * as mandiSubscriptionChargesSchema from "./schema/mandiSubscriptionCharges"
import * as enumsSchema from "./schema/enums"
import { sql } from "drizzle-orm"

const client = postgres(env.DATABASE_URL)

export const db = drizzle(client, {
    schema: {
        ...adminSchema,
        ...citySchema,
        ...mandiSchema,
        ...mandiCounterSchema,
        ...mandiPriceSchema,
        ...mandiStoreSchema,
        ...mandiVendorSchema,
        ...marketMandiOrderSchema,
        ...marketMandiOrderItemSchema,
        ...marketMandiOrderStatusHistorySchema,
        ...marketStoreSchema,
        ...marketVendorSchema,
        ...marketVendorWalletSchema,
        ...marketVendorWalletTransactionSchema,
        ...marketMandiPaymentSchema,
        ...marketMandiPaymentStatusHistorySchema,
        ...marketMandiPaymentWebhookEventSchema,
        ...marketMandiPaymentSplitSchema,
        ...marketVendorCartSchema,
        ...vegSchema,
        ...marketKycDocSchema,
        ...mandiKycDocSchema,
        ...marketSubscriptionChargesSchema,
        ...mandiSubscriptionChargesSchema,
        ...enumsSchema,
    },
    casing: "snake_case",
})

/** Call once at app startup to verify DB connectivity */
export async function testDBConnection() {
    try {
        await db.execute(sql`SELECT 1`)
        console.log("DB connected")
    } catch (error) {
        console.error("DB connection failed:", error)
        throw error
    }
}
