import { TRPCError } from "@trpc/server"
import { type Context } from "../../trpc"
import type { TSaveStoreSchema, TSaveKycSchema } from "./store.schema"
import { db, admin, vendors, stores, kycDocs } from "../../db"
import { eq, sql } from "drizzle-orm"

export async function saveStore({ input }: { input: TSaveStoreSchema; ctx: Context }) {
    try {
        const [newStore] = await db
            .insert(stores)
            .values({
                vendorId: input.vendorId,
                storeName: input.storeName,
                fullAddress: input.fullAddress,
                lat: input.lat,
                lng: input.lng,
                radiusKm: 4,
                storeImage: "https://example.com/store.png",
            })
            .returning()

        return { success: true, store: newStore }
    } catch (error) {
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function saveKyc({ input }: { input: TSaveKycSchema; ctx: Context }) {
    try {
        const [kycRecord] = await db
            .insert(kycDocs)
            .values({
                vendorId: input.vendorId,
                storeId: input.storeId,
                type: input.docType,
                docId: input.docId,
                frontUrl: input.frontUrl,
                backUrl: input.backUrl,
                storefrontUrl: input.storefrontUrl,
            })
            .returning()

        return { success: true, kyc: kycRecord }
    } catch (error) {
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}
