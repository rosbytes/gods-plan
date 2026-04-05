import { TRPCError } from "@trpc/server"
import type { Context } from "../../trpc"
import type { TListVendorsSchema, TCreateVendorSchema } from "./vendor.schema"
import { db, vendors, admin } from "../../db"
import { ilike, or, desc } from "drizzle-orm"

export async function listVendors({ input }: { input: TListVendorsSchema; ctx: Context }) {
    try {
        const query = db.select().from(vendors).orderBy(desc(vendors.createdAt))

        if (input.search) {
            query.where(
                or(
                    ilike(vendors.fullName, "%" + input.search + "%"),
                    ilike(vendors.primaryPhone, "%" + input.search + "%"),
                ),
            )
        }

        const items = await query.limit(20)

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
