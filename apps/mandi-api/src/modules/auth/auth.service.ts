import { db, admin, eq } from "@ros/db"

export const findAdminByPhone = async ({ phone }: { phone: string }) => {
    const [adminRecord] = await db.select().from(admin).where(eq(admin.phone, phone))
    return adminRecord
}
