import { db, eq, mandiVendor } from "@ros/db"

export const findMandiVendorByPhone = async ({ phone }: { phone: string }) => {
    const [vendor] = await db.select().from(mandiVendor).where(eq(mandiVendor.primaryPhone, phone))
    return vendor
}

export const updateMandiVendorPin = async ({ id, pin }: { id: string; pin: string }) => {
    await db.update(mandiVendor).set({ pin }).where(eq(mandiVendor.id, id))
}
