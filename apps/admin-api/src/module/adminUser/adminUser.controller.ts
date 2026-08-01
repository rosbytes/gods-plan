import { TRPCError } from "@trpc/server"
import type {
    TCreateAdminUserSchema,
    TUpdateAdminUserSchema,
    TListAdminUsersSchema,
    TDeleteAdminUserSchema,
} from "./adminUser.schema"
import { db, admin, ilike, desc, eq, or, and } from "@ros/db"
import { hashAdminPassword } from "@ros/commons"
import type { AdminContext } from "../../middlewares"

export async function createAdminUser({
    input,
}: {
    input: TCreateAdminUserSchema
    ctx: AdminContext
}) {
    try {
        // Check if phone number already exists
        const [existingPhone] = await db.select().from(admin).where(eq(admin.phone, input.phone))
        if (existingPhone) {
            throw new TRPCError({
                message: "An admin or operator with this phone number already exists",
                code: "CONFLICT",
            })
        }

        // Check if email already exists if provided
        if (input.email) {
            const [existingEmail] = await db
                .select()
                .from(admin)
                .where(eq(admin.email, input.email))
            if (existingEmail) {
                throw new TRPCError({
                    message: "An admin or operator with this email already exists",
                    code: "CONFLICT",
                })
            }
        }

        const hashedPin = hashAdminPassword(input.pin)

        const [newAdmin] = await db
            .insert(admin)
            .values({
                name: input.name,
                phone: input.phone,
                email: input.email || null,
                pin: hashedPin,
                role: input.role,
                isActive: true,
            })
            .returning({
                id: admin.id,
                name: admin.name,
                phone: admin.phone,
                email: admin.email,
                role: admin.role,
                isActive: admin.isActive,
                createdAt: admin.createdAt,
            })

        return { success: true, user: newAdmin }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function listAdminUsers({
    input,
}: {
    input: TListAdminUsersSchema
    ctx: AdminContext
}) {
    try {
        const conditions = []
        if (input.search?.trim()) {
            const query = `%${input.search.trim()}%`
            conditions.push(
                or(ilike(admin.name, query), ilike(admin.phone, query), ilike(admin.email, query)),
            )
        }

        const items = await db
            .select({
                id: admin.id,
                name: admin.name,
                phone: admin.phone,
                email: admin.email,
                role: admin.role,
                isActive: admin.isActive,
                lastLoginAt: admin.lastLoginAt,
                createdAt: admin.createdAt,
            })
            .from(admin)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(admin.createdAt))
            .limit(100)

        return { items }
    } catch (error) {
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function updateAdminUser({
    input,
}: {
    input: TUpdateAdminUserSchema
    ctx: AdminContext
}) {
    try {
        const { id, pin, email, ...updates } = input

        const updateData: Record<string, any> = { ...updates }

        if (email !== undefined) {
            updateData.email = email || null
        }

        if (pin) {
            updateData.pin = hashAdminPassword(pin)
        }

        // Remove undefined values
        const cleanEntries = Object.entries(updateData).filter(([, v]) => v !== undefined)
        if (cleanEntries.length === 0) {
            throw new TRPCError({ message: "No fields to update", code: "BAD_REQUEST" })
        }

        const [updated] = await db
            .update(admin)
            .set(Object.fromEntries(cleanEntries))
            .where(eq(admin.id, id))
            .returning({
                id: admin.id,
                name: admin.name,
                phone: admin.phone,
                email: admin.email,
                role: admin.role,
                isActive: admin.isActive,
                updatedAt: admin.updatedAt,
            })

        if (!updated) throw new TRPCError({ message: "Admin user not found", code: "NOT_FOUND" })

        return { success: true, user: updated }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function deleteAdminUser({
    input,
    ctx,
}: {
    input: TDeleteAdminUserSchema
    ctx: AdminContext
}) {
    try {
        // Prevent deleting oneself
        if (input.id === ctx.admin.id) {
            throw new TRPCError({
                message: "You cannot delete your own admin account",
                code: "BAD_REQUEST",
            })
        }

        const [deleted] = await db.delete(admin).where(eq(admin.id, input.id)).returning()

        if (!deleted) throw new TRPCError({ message: "Admin user not found", code: "NOT_FOUND" })

        return { success: true, id: deleted.id }
    } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Database Error",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}
