import { TRPCError } from "@trpc/server"
import type {
    TListVendorsSchema,
    TCreateMarketVendorSchema,
    TCreateMandiVendorSchema,
    TGetVendorSchema,
    TUpdateVendorSchema,
    TToggleVendorStatusSchema,
} from "./vendor.schema"
import {
    db,
    marketVendor,
    mandiVendor,
    marketStore,
    mandiStore,
    marketSubcriptionCharges,
    eq,
    ilike,
    desc,
    sql,
    unionAll,
} from "@ros/db"
import { or } from "@ros/db"
import type { AdminContext } from "../../middlewares"

export async function listMarketVendors({
    input,
}: {
    input: TListVendorsSchema
    ctx: AdminContext
}) {
    try {
        const items = await db.query.marketVendor.findMany({
            where: input.search
                ? or(
                      ilike(marketVendor.fullName, "%" + input.search + "%"),
                      ilike(marketVendor.primaryPhone, "%" + input.search + "%"),
                  )
                : undefined,
            orderBy: [desc(marketVendor.createdAt)],
            limit: 20,
            with: {
                marketStores: true,
            },
        })

        return { items }
    } catch (error) {
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function listMandiVendors({
    input,
}: {
    input: TListVendorsSchema
    ctx: AdminContext
}) {
    try {
        const items = await db.query.mandiVendor.findMany({
            where: input.search
                ? or(
                      ilike(mandiVendor.fullName, "%" + input.search + "%"),
                      ilike(mandiVendor.primaryPhone, "%" + input.search + "%"),
                  )
                : undefined,
            orderBy: [desc(mandiVendor.createdAt)],
            limit: 20,
            with: {
                mandiStores: true,
            },
        })

        return { items }
    } catch (error) {
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function listVendors({ input }: { input: TListVendorsSchema; ctx: AdminContext }) {
    try {
        const items = await db.transaction(async (tx) => {
            const marketQuery = tx
                .select({
                    id: marketVendor.id,
                    fullName: marketVendor.fullName,
                    primaryPhone: marketVendor.primaryPhone,
                    createdAt: marketVendor.createdAt,
                    type: sql<string>`'market'`.as("type"),
                })
                .from(marketVendor)
                .where(
                    input.search
                        ? or(
                              ilike(marketVendor.fullName, `%${input.search}%`),
                              ilike(marketVendor.primaryPhone, `%${input.search}%`),
                          )
                        : undefined,
                )

            const mandiQuery = tx
                .select({
                    id: mandiVendor.id,
                    fullName: mandiVendor.fullName,
                    primaryPhone: mandiVendor.primaryPhone,
                    createdAt: mandiVendor.createdAt,
                    type: sql<string>`'mandi'`.as("type"),
                })
                .from(mandiVendor)
                .where(
                    input.search
                        ? or(
                              ilike(mandiVendor.fullName, `%${input.search}%`),
                              ilike(mandiVendor.primaryPhone, `%${input.search}%`),
                          )
                        : undefined,
                )

            return await tx
                .select()
                .from(unionAll(marketQuery, mandiQuery).as("vendors"))
                .orderBy(desc(sql`created_at`))
                .limit(20)
        })

        return { items }
    } catch (error) {
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function createMarketVendor({
    input,
    ctx,
}: {
    input: TCreateMarketVendorSchema
    ctx: AdminContext
}) {
    try {
        const [newVendor] = await db
            .insert(marketVendor)
            .values({
                fullName: input.fullName,
                primaryPhone: input.primaryPhone,
                alternatePhone: input.alternatePhone ?? null,
                createdBy: ctx.admin.id,
            })
            .returning()

        return { success: true, vendor: newVendor }
    } catch (error) {
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function createMandiVendor({
    input,
    ctx,
}: {
    input: TCreateMandiVendorSchema
    ctx: AdminContext
}) {
    try {
        const [newVendor] = await db
            .insert(mandiVendor)
            .values({
                fullName: input.fullName,
                primaryPhone: input.primaryPhone,
                alternatePhone: input.alternatePhone ?? null,
                createdBy: ctx.admin.id,
            })
            .returning()

        return { success: true, vendor: newVendor }
    } catch (error) {
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function getMarketVendor({ input }: { input: TGetVendorSchema }) {
    try {
        const vendor = await db.query.marketVendor.findFirst({
            where: eq(marketVendor.id, input.vendorId),
            with: {
                marketStores: {
                    with: {
                        agreement: {
                            with: {
                                signedByAdmin: true,
                            },
                        },
                    },
                },
                kycDocs: true,
            },
        })
        if (!vendor) throw new TRPCError({ message: "Vendor not found", code: "NOT_FOUND" })

        // Expose subscription charges for this vendor
        const [charge] = await db
            .select()
            .from(marketSubcriptionCharges)
            .where(eq(marketSubcriptionCharges.vendorId, vendor.id))
            .limit(1)

        return { vendor, charge: charge || null }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function getMandiVendor({ input }: { input: TGetVendorSchema }) {
    try {
        const vendor = await db.query.mandiVendor.findFirst({
            where: eq(mandiVendor.id, input.vendorId),
            with: {
                mandiStores: {
                    with: {
                        agreement: {
                            with: {
                                signedByAdmin: true,
                            },
                        },
                    },
                },
                kycDocs: true,
            },
        })
        if (!vendor) throw new TRPCError({ message: "Vendor not found", code: "NOT_FOUND" })

        return { vendor, charge: null }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function getVendor({ input }: { input: TGetVendorSchema }) {
    try {
        const marketVendorData = await db.query.marketVendor.findFirst({
            where: eq(marketVendor.id, input.vendorId),
            with: {
                marketStores: {
                    with: {
                        agreement: {
                            with: {
                                signedByAdmin: true,
                            },
                        },
                    },
                },
                kycDocs: true,
            },
        })

        if (marketVendorData) {
            const [charge] = await db
                .select()
                .from(marketSubcriptionCharges)
                .where(eq(marketSubcriptionCharges.vendorId, marketVendorData.id))
                .limit(1)

            return {
                type: "market" as const,
                vendor: marketVendorData,
                charge: charge || null,
            }
        }

        const mandiVendorData = await db.query.mandiVendor.findFirst({
            where: eq(mandiVendor.id, input.vendorId),
            with: {
                mandiStores: {
                    with: {
                        agreement: {
                            with: {
                                signedByAdmin: true,
                            },
                        },
                    },
                },
                kycDocs: true,
            },
        })

        if (mandiVendorData) {
            return {
                type: "mandi" as const,
                vendor: mandiVendorData,
                charge: null,
            }
        }

        throw new TRPCError({ message: "Vendor not found", code: "NOT_FOUND" })
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function deleteVendor({ input }: { input: { id: string }; ctx: AdminContext }) {
    try {
        const [deletedMarket] = await db
            .delete(marketVendor)
            .where(eq(marketVendor.id, input.id))
            .returning()
        if (deletedMarket) return { success: true, vendor: deletedMarket }

        const [deletedMandi] = await db
            .delete(mandiVendor)
            .where(eq(mandiVendor.id, input.id))
            .returning()
        if (deletedMandi) return { success: true, vendor: deletedMandi }

        throw new TRPCError({ message: "Vendor not found", code: "NOT_FOUND" })
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function updateVendor({ input }: { input: TUpdateVendorSchema }) {
    try {
        const { vendorId, fullName, primaryPhone, alternatePhone, storeName, fullAddress } = input

        // 1. Try updating marketVendor
        const marketVendorData = await db.query.marketVendor.findFirst({
            where: eq(marketVendor.id, vendorId),
            with: { marketStores: true },
        })

        if (marketVendorData) {
            const vendorUpdates: Record<string, any> = {}
            if (fullName !== undefined) vendorUpdates.fullName = fullName
            if (primaryPhone !== undefined) vendorUpdates.primaryPhone = primaryPhone
            if (alternatePhone !== undefined) vendorUpdates.alternatePhone = alternatePhone || null

            if (Object.keys(vendorUpdates).length > 0) {
                await db
                    .update(marketVendor)
                    .set(vendorUpdates)
                    .where(eq(marketVendor.id, vendorId))
            }

            if (
                (storeName !== undefined || fullAddress !== undefined) &&
                marketVendorData.marketStores?.[0]
            ) {
                const storeUpdates: Record<string, any> = {}
                if (storeName !== undefined) storeUpdates.storeName = storeName
                if (fullAddress !== undefined) storeUpdates.fullAddress = fullAddress

                if (Object.keys(storeUpdates).length > 0) {
                    await db
                        .update(marketStore)
                        .set(storeUpdates)
                        .where(eq(marketStore.id, marketVendorData.marketStores[0].id))
                }
            }

            return { success: true }
        }

        // 2. Try updating mandiVendor
        const mandiVendorData = await db.query.mandiVendor.findFirst({
            where: eq(mandiVendor.id, vendorId),
            with: { mandiStores: true },
        })

        if (mandiVendorData) {
            const vendorUpdates: Record<string, any> = {}
            if (fullName !== undefined) vendorUpdates.fullName = fullName
            if (primaryPhone !== undefined) vendorUpdates.primaryPhone = primaryPhone
            if (alternatePhone !== undefined) vendorUpdates.alternatePhone = alternatePhone || null

            if (Object.keys(vendorUpdates).length > 0) {
                await db.update(mandiVendor).set(vendorUpdates).where(eq(mandiVendor.id, vendorId))
            }

            if (
                (storeName !== undefined || fullAddress !== undefined) &&
                mandiVendorData.mandiStores?.[0]
            ) {
                const storeUpdates: Record<string, any> = {}
                if (storeName !== undefined) storeUpdates.storeName = storeName
                if (fullAddress !== undefined) storeUpdates.fullAddress = fullAddress

                if (Object.keys(storeUpdates).length > 0) {
                    await db
                        .update(mandiStore)
                        .set(storeUpdates)
                        .where(eq(mandiStore.id, mandiVendorData.mandiStores[0].id))
                }
            }

            return { success: true }
        }

        throw new TRPCError({ message: "Vendor not found", code: "NOT_FOUND" })
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function toggleVendorStatus({
    input,
}: {
    input: TToggleVendorStatusSchema
    ctx: AdminContext
}) {
    try {
        const { vendorId, type, field, value } = input

        const updateData: { isApproved?: boolean } = {}
        if (field === "isApproved") updateData.isApproved = value

        if (type === "market") {
            const [updated] = await db
                .update(marketVendor)
                .set(updateData)
                .where(eq(marketVendor.id, vendorId))
                .returning()
            if (!updated)
                throw new TRPCError({ message: "Market vendor not found", code: "NOT_FOUND" })
            return { success: true, vendor: updated }
        }

        const [updated] = await db
            .update(mandiVendor)
            .set(updateData)
            .where(eq(mandiVendor.id, vendorId))
            .returning()
        if (!updated) throw new TRPCError({ message: "Mandi vendor not found", code: "NOT_FOUND" })
        return { success: true, vendor: updated }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}
