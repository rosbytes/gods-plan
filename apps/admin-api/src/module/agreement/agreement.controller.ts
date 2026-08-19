import { TRPCError } from "@trpc/server"
import { db, marketStoreAgreement, mandiStoreAgreement, eq, and } from "@ros/db"
import type { AdminContext } from "../../middlewares"
import type {
    TSignAgreementSchema,
    TGetStoreAgreementSchema,
    TGetAgreementByIdSchema,
} from "./agreement.schema"

export async function signAgreement({
    input,
    ctx,
}: {
    input: TSignAgreementSchema
    ctx: AdminContext
}) {
    try {
        const {
            vendorId,
            storeId,
            type,
            signerName,
            signerPhone,
            verificationMethod,
            verificationIdentifier,
            title,
            version,
            termsSnapshot,
            signedPdfUrl,
        } = input

        if (type === "market") {
            // Check if existing agreement already recorded for this store
            const existing = await db.query.marketStoreAgreement.findFirst({
                where: and(
                    eq(marketStoreAgreement.vendorId, vendorId),
                    eq(marketStoreAgreement.storeId, storeId),
                ),
            })

            if (existing) {
                const [updated] = await db
                    .update(marketStoreAgreement)
                    .set({
                        signerName,
                        signerPhone,
                        verificationMethod,
                        verificationIdentifier:
                            verificationIdentifier || existing.verificationIdentifier,
                        title: title || existing.title,
                        version: version || existing.version,
                        termsSnapshot: termsSnapshot || existing.termsSnapshot,
                        signedPdfUrl: signedPdfUrl || existing.signedPdfUrl,
                        signedByAdminId: ctx.admin.id,
                        signedAt: new Date(),
                    })
                    .where(eq(marketStoreAgreement.id, existing.id))
                    .returning()

                return { success: true, agreement: updated }
            }

            const [created] = await db
                .insert(marketStoreAgreement)
                .values({
                    vendorId,
                    storeId,
                    agreementType: "nda_and_intent",
                    title,
                    version,
                    termsSnapshot,
                    signerName,
                    signerPhone,
                    verificationMethod,
                    verificationIdentifier: verificationIdentifier || signerPhone,
                    signedPdfUrl: signedPdfUrl || null,
                    signedByAdminId: ctx.admin.id,
                    signedAt: new Date(),
                })
                .returning()

            return { success: true, agreement: created }
        }

        // Mandi store agreement
        const existing = await db.query.mandiStoreAgreement.findFirst({
            where: and(
                eq(mandiStoreAgreement.vendorId, vendorId),
                eq(mandiStoreAgreement.storeId, storeId),
            ),
        })

        if (existing) {
            const [updated] = await db
                .update(mandiStoreAgreement)
                .set({
                    signerName,
                    signerPhone,
                    verificationMethod,
                    verificationIdentifier:
                        verificationIdentifier || existing.verificationIdentifier,
                    title: title || existing.title,
                    version: version || existing.version,
                    termsSnapshot: termsSnapshot || existing.termsSnapshot,
                    signedPdfUrl: signedPdfUrl || existing.signedPdfUrl,
                    signedByAdminId: ctx.admin.id,
                    signedAt: new Date(),
                })
                .where(eq(mandiStoreAgreement.id, existing.id))
                .returning()

            return { success: true, agreement: updated }
        }

        const [created] = await db
            .insert(mandiStoreAgreement)
            .values({
                vendorId,
                storeId,
                agreementType: "nda_and_intent",
                title,
                version,
                termsSnapshot,
                signerName,
                signerPhone,
                verificationMethod,
                verificationIdentifier: verificationIdentifier || signerPhone,
                signedPdfUrl: signedPdfUrl || null,
                signedByAdminId: ctx.admin.id,
                signedAt: new Date(),
            })
            .returning()

        return { success: true, agreement: created }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Failed to record agreement",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function getStoreAgreement({
    input,
}: {
    input: TGetStoreAgreementSchema
    ctx: AdminContext
}) {
    try {
        const { vendorId, storeId, type } = input

        if (type === "market") {
            const agreement = await db.query.marketStoreAgreement.findFirst({
                where: and(
                    eq(marketStoreAgreement.vendorId, vendorId),
                    eq(marketStoreAgreement.storeId, storeId),
                ),
                with: {
                    signedByAdmin: true,
                },
            })

            return { agreement: agreement || null }
        }

        const agreement = await db.query.mandiStoreAgreement.findFirst({
            where: and(
                eq(mandiStoreAgreement.vendorId, vendorId),
                eq(mandiStoreAgreement.storeId, storeId),
            ),
            with: {
                signedByAdmin: true,
            },
        })

        return { agreement: agreement || null }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Failed to fetch agreement",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function getAgreementById({
    input,
}: {
    input: TGetAgreementByIdSchema
    ctx: AdminContext
}) {
    try {
        const { agreementId, type } = input

        if (type === "market") {
            const agreement = await db.query.marketStoreAgreement.findFirst({
                where: eq(marketStoreAgreement.id, agreementId),
                with: {
                    signedByAdmin: true,
                    store: true,
                    marketVendor: true,
                },
            })

            if (!agreement) {
                throw new TRPCError({ message: "Agreement not found", code: "NOT_FOUND" })
            }

            return { agreement }
        }

        const agreement = await db.query.mandiStoreAgreement.findFirst({
            where: eq(mandiStoreAgreement.id, agreementId),
            with: {
                signedByAdmin: true,
                store: true,
                mandiVendor: true,
            },
        })

        if (!agreement) {
            throw new TRPCError({ message: "Agreement not found", code: "NOT_FOUND" })
        }

        return { agreement }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Failed to fetch agreement",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}
