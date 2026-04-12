import { TRPCError } from "@trpc/server"
import type { Context } from "../../trpc"
import type { TListVendorsSchema, TCreateVendorSchema, TGetVendorSchema } from "./vendor.schema"
import { db, vendors, admin, registrationCharges } from "../../db"
import { ilike, or, desc, eq } from "drizzle-orm"

export async function listVendors({ input }: { input: TListVendorsSchema; ctx: Context }) {
    try {
        const items = await db.query.vendors.findMany({
            where: input.search
                ? or(
                      ilike(vendors.fullName, "%" + input.search + "%"),
                      ilike(vendors.primaryPhone, "%" + input.search + "%"),
                  )
                : undefined,
            orderBy: [desc(vendors.createdAt)],
            limit: 20,
            with: {
                kycDocs: true,
                stores: true,
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

export async function createVendor({ input }: { input: TCreateVendorSchema; ctx: Context }) {
    try {
        // Link vendor to the first admin found (since we have a single admin setup)
        const existingAdmin = await db
            .select()
            .from(admin)
            .limit(1)
            .then((res) => res[0])
        if (!existingAdmin) throw new TRPCError({ message: "No admin found", code: "UNAUTHORIZED" })

        const [newVendor] = await db
            .insert(vendors)
            .values({
                fullName: input.fullName,
                primaryPhone: input.primaryPhone,
                alternatePhone: input.alternatePhone ?? null,
                type: input.type,
                createdBy: existingAdmin.id,
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

export async function getVendor({ input }: { input: TGetVendorSchema }) {
    try {
        const vendor = await db.query.vendors.findFirst({
            where: eq(vendors.id, input.vendorId),
            with: {
                kycDocs: true,
                stores: true,
            },
        })
        if (!vendor) throw new TRPCError({ message: "Vendor not found", code: "NOT_FOUND" })

        // Expose registration charges explicitly matching profile constraints
        const [charge] = await db
            .select()
            .from(registrationCharges)
            .where(eq(registrationCharges.vendorId, vendor.id))
            .limit(1)

        return { vendor, charge: charge || null }
    } catch (error) {
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}
