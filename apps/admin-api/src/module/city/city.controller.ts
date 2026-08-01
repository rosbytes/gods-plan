import { TRPCError } from "@trpc/server"
import type { TCreateCitySchema, TUpdateCitySchema, TListCitiesSchema } from "./city.schema"
import { db, city, ilike, desc, eq } from "@ros/db"
import type { AdminContext } from "../../middlewares"

export async function createCity({ input, ctx }: { input: TCreateCitySchema; ctx: AdminContext }) {
    try {
        const [newCity] = await db
            .insert(city)
            .values({
                name: input.name,
                state: input.state,
                pincode: input.pincode ?? null,
                cityImage: input.cityImage ?? null,
                createdBy: ctx.admin.id,
            })
            .returning()

        return { success: true, city: newCity }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function listCities({ input }: { input: TListCitiesSchema; ctx: AdminContext }) {
    try {
        const items = await db.query.city.findMany({
            where: input.search ? ilike(city.name, "%" + input.search + "%") : undefined,
            orderBy: [desc(city.createdAt)],
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

export async function updateCity({ input }: { input: TUpdateCitySchema; ctx: AdminContext }) {
    try {
        const { id, ...updates } = input

        // removed undefined values
        const entries = Object.entries(updates)

        const filteredEntries = entries.filter(([, value]) => value !== undefined)

        const inputWithoutUndefinedValues = Object.fromEntries(filteredEntries) as Omit<
            TUpdateCitySchema,
            "id"
        >

        if (Object.keys(inputWithoutUndefinedValues).length === 0) {
            throw new TRPCError({ message: "No fields to update", code: "BAD_REQUEST" })
        }

        const [updated] = await db
            .update(city)
            .set(inputWithoutUndefinedValues)
            .where(eq(city.id, id))
            .returning()

        if (!updated) throw new TRPCError({ message: "City not found", code: "NOT_FOUND" })

        return { success: true, city: updated }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function deleteCity({ input }: { input: { id: string }; ctx: AdminContext }) {
    try {
        const [deleted] = await db.delete(city).where(eq(city.id, input.id)).returning()

        if (!deleted) throw new TRPCError({ message: "City not found", code: "NOT_FOUND" })

        return { success: true, city: deleted }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}
