import { db, admin, eq, sql } from "@ros/db"

export const findAdminByPhone = async ({ phone }: { phone: string }) => {
    const [adminRecord] = await db.select().from(admin).where(eq(admin.phone, phone))
    return adminRecord
}

export const findAdminById = async ({ id }: { id: string }) => {
    const [adminRecord] = await db.select().from(admin).where(eq(admin.id, id))
    return adminRecord
}

export const updateAdminLoginTime = async ({ id }: { id: string }) => {
    const [updatedAdmin] = await db
        .update(admin)
        .set({ lastLoginAt: sql`now()` })
        .where(eq(admin.id, id))
        .returning()
    return updatedAdmin
}

export const updateAdminRefreshToken = async ({ id, token }: { id: string; token: string }) => {
    const [updatedAdmin] = await db
        .update(admin)
        .set({ refreshToken: token })
        .where(eq(admin.id, id))
        .returning()
    return updatedAdmin
}
