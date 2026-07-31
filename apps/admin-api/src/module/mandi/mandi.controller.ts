import { TRPCError } from "@trpc/server"
import type { TCreateMandiSchema, TUpdateMandiSchema, TListMandisSchema } from "./mandi.schema"
import { db, mandi, ilike, desc, eq, and } from "@ros/db"
import { AdminContext } from "../../middlewares"

export async function createMandi({
    input,
    ctx,
}: {
    input: TCreateMandiSchema
    ctx: AdminContext
}) {
    try {
        const [newMandi] = await db
            .insert(mandi)
            .values({
                name: input.name,
                cityId: input.cityId,
                lat: input.lat,
                lng: input.lng,
                fullAddress: input.fullAddress ?? null,
                mandiImage: input.mandiImage ?? null,
                createdBy: ctx.admin.id,
            })
            .returning()

        return { success: true, mandi: newMandi }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function listMandis({ input }: { input: TListMandisSchema; ctx: AdminContext }) {
    try {
        const conditions = []
        if (input.search) conditions.push(ilike(mandi.name, "%" + input.search + "%"))
        if (input.cityId) conditions.push(eq(mandi.cityId, input.cityId))

        const items = await db.query.mandi.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: [desc(mandi.createdAt)],
            limit: 50,
            with: {
                city: true,
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

export async function listAllMandis({ ctx }: { ctx: AdminContext }) {
    try {
        const items = await db.select().from(mandi)

        return items
    } catch (error) {
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function updateMandi({ input }: { input: TUpdateMandiSchema; ctx: AdminContext }) {
    try {
        const { id, ...updates } = input

        // removed undefined values
        const entries = Object.entries(updates)

        const filteredEntries = entries.filter(([, value]) => value !== undefined)

        const inputWithoutUndefinedValues = Object.fromEntries(filteredEntries) as Omit<
            TUpdateMandiSchema,
            "id"
        >

        if (Object.keys(inputWithoutUndefinedValues).length === 0) {
            throw new TRPCError({ message: "No fields to update", code: "BAD_REQUEST" })
        }

        const [updated] = await db
            .update(mandi)
            .set(inputWithoutUndefinedValues)
            .where(eq(mandi.id, id))
            .returning()

        if (!updated) throw new TRPCError({ message: "Mandi not found", code: "NOT_FOUND" })

        return { success: true, mandi: updated }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}
