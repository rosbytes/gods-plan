import { TRPCError } from "@trpc/server"
import type {
    TSaveStoreSchema,
    TSaveKycSchema,
    TGetKycSchema,
    TCreateMandiStoreSchema,
    TCreateMarketStoreSchema,
    TUpdateMandiStoreSchema,
    TUpdateMarketStoreSchema,
    TSaveMandiStoreKycSchema,
    TSaveMarketStoreKycSchema,
} from "./store.schema"
import { db, marketStore, marketKycDoc, eq, and, mandiStore, mandiKycDoc } from "@ros/db"
import type { AdminContext } from "../../middlewares"

export async function saveStore({ input }: { input: TSaveStoreSchema; ctx: AdminContext }) {
    try {
        const [newStore] = await db
            .insert(marketStore)
            .values({
                vendorId: input.vendorId,
                mandiId: input.mandiId,
                // cityId: input.cityId,
                storeName: input.storeName,
                fullAddress: input.fullAddress,
                lat: input.lat,
                lng: input.lng,
                radiusM: 4000,
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

export async function createMandiStore({
    input,
}: {
    input: TCreateMandiStoreSchema
    ctx: AdminContext
}) {
    try {
        const [newStore] = await db
            .insert(mandiStore)
            .values({
                vendorId: input.vendorId,
                mandiId: input.mandiId,
                vegId: input.vegId,
                storeName: input.storeName,
                fullAddress: input.fullAddress,
                lat: input.lat,
                lng: input.lng,
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

export async function updateMandiStore({
    input,
}: {
    input: TUpdateMandiStoreSchema
    ctx: AdminContext
}) {
    try {
        const { storeId, ...updates } = input

        // removed undefined values
        const entries = Object.entries(updates)

        const filteredEntries = entries.filter(([, value]) => value !== undefined)

        const inputWithoutUndefinedValues = Object.fromEntries(filteredEntries) as Omit<
            TUpdateMandiStoreSchema,
            "storeId"
        >

        if (Object.keys(inputWithoutUndefinedValues).length === 0) {
            throw new TRPCError({ message: "No fields to update", code: "BAD_REQUEST" })
        }

        const [updatedStore] = await db
            .update(mandiStore)
            .set(inputWithoutUndefinedValues)
            .where(eq(mandiStore.id, storeId))
            .returning()

        return { success: true, store: updatedStore }
    } catch (error) {
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function createMarketStore({
    input,
}: {
    input: TCreateMarketStoreSchema
    ctx: AdminContext
}) {
    try {
        // TODO: generate the slot id with logic

        const [newStore] = await db
            .insert(marketStore)
            .values({
                vendorId: input.vendorId,
                mandiId: input.mandiId,
                storeName: input.storeName,
                fullAddress: input.fullAddress,
                lat: input.lat,
                lng: input.lng,
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

export async function updateMarketStore({
    input,
}: {
    input: TUpdateMarketStoreSchema
    ctx: AdminContext
}) {
    try {
        const { storeId, ...updates } = input

        // removed undefined values
        const entries = Object.entries(updates)

        const filteredEntries = entries.filter(([, value]) => value !== undefined)

        const inputWithoutUndefinedValues = Object.fromEntries(filteredEntries) as Omit<
            TUpdateMarketStoreSchema,
            "storeId"
        >

        if (Object.keys(inputWithoutUndefinedValues).length === 0) {
            throw new TRPCError({ message: "No fields to update", code: "BAD_REQUEST" })
        }

        const [updatedStore] = await db
            .update(marketStore)
            .set(inputWithoutUndefinedValues)
            .where(eq(marketStore.id, storeId))
            .returning()

        return { success: true, store: updatedStore }
    } catch (error) {
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function saveMandiStoreKyc({
    input,
}: {
    input: TSaveMandiStoreKycSchema
    ctx: AdminContext
}) {
    try {
        const [kycRecord] = await db
            .insert(mandiKycDoc)
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

export async function saveMarketStoreKyc({
    input,
}: {
    input: TSaveMarketStoreKycSchema
    ctx: AdminContext
}) {
    try {
        const [kycRecord] = await db
            .insert(marketKycDoc)
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

export async function saveKyc({ input }: { input: TSaveKycSchema; ctx: AdminContext }) {
    try {
        const [kycRecord] = await db
            .insert(marketKycDoc)
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

export async function getKyc({ input }: { input: TGetKycSchema; ctx: AdminContext }) {
    try {
        let result = await db
            .select()
            .from(marketKycDoc)
            .where(
                and(
                    eq(marketKycDoc.vendorId, input.vendorId),
                    eq(marketKycDoc.storeId, input.storeId),
                ),
            )
            .limit(1)

        if (!result.length) {
            result = await db
                .select()
                .from(mandiKycDoc)
                .where(
                    and(
                        eq(mandiKycDoc.vendorId, input.vendorId),
                        eq(mandiKycDoc.storeId, input.storeId),
                    ),
                )
                .limit(1)
        }

        if (!result.length) throw new TRPCError({ message: "KYC not found", code: "NOT_FOUND" })
        return { kyc: result[0] }
    } catch (error) {
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}
