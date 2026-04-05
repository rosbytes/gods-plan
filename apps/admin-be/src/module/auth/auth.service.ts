import { db, admin } from "../../db"
import { eq } from "drizzle-orm"

export const findAdminByPhone = async ({ phone }: { phone: string }) => {
    const [adminRecord] = await db.select().from(admin).where(eq(admin.phone, phone))
    return adminRecord
}
