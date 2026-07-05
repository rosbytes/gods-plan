import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { env } from "../configs/env"
import * as adminSchema from "./schema/admin"
import * as vendorSchema from "./schema/vendors"
import * as kycDocsSchema from "./schema/kycDocs"
import * as vendorLocationsSchema from "./schema/stores"
import * as registrationChargesSchema from "./schema/registrationCharges"

const client = postgres(env.DATABASE_URL)
client`SELECT 1`.then(() => console.log("DB connected")).catch(console.error)
export const db = drizzle(client, {
    schema: {
        ...adminSchema,
        ...vendorSchema,
        ...kycDocsSchema,
        ...vendorLocationsSchema,
        ...registrationChargesSchema,
    },
    casing: "snake_case",
})
