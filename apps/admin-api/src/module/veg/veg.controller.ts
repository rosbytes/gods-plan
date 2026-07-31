import { TRPCError } from "@trpc/server"
import type { TCreateVegSchema, TUpdateVegSchema, TListVegsSchema } from "./veg.schema"
import { db, veg, ilike, desc, eq } from "@ros/db"
import { AdminContext } from "../../middlewares"

export async function createVeg({ input, ctx }: { input: TCreateVegSchema; ctx: AdminContext }) {
    try {
        const [newVeg] = await db
            .insert(veg)
            .values({
                name: input.name,
                nameInHindi: input.nameInHindi ?? null,
                vegPrimaryImage: input.vegPrimaryImage ?? null,
                createdBy: ctx.admin.id,
            })
            .returning()

        return { success: true, veg: newVeg }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function listVegs({ input }: { input: TListVegsSchema; ctx: AdminContext }) {
    try {
        const items = await db.query.veg.findMany({
            where: input.search ? ilike(veg.name, "%" + input.search + "%") : undefined,
            orderBy: [desc(veg.createdAt)],
            limit: 50,
        })

        return { items }
    } catch (error) {
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function getAllVegs() {
    try {
        const items = await db.select().from(veg)

        return items
    } catch (error) {
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function updateVeg({ input }: { input: TUpdateVegSchema; ctx: AdminContext }) {
    try {
        const { id, ...updates } = input

        // removed undefined values
        const entries = Object.entries(updates)

        const filteredEntries = entries.filter(([, value]) => value !== undefined)

        const inputWithoutUndefinedValues = Object.fromEntries(filteredEntries) as Omit<
            TUpdateVegSchema,
            "id"
        >

        if (Object.keys(inputWithoutUndefinedValues).length === 0) {
            throw new TRPCError({ message: "No fields to update", code: "BAD_REQUEST" })
        }

        const [updated] = await db
            .update(veg)
            .set(inputWithoutUndefinedValues)
            .where(eq(veg.id, id))
            .returning()

        if (!updated) throw new TRPCError({ message: "Vegetable not found", code: "NOT_FOUND" })

        return { success: true, veg: updated }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}
