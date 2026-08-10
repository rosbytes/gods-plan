import { z } from "zod"

export const ZPickupItemSchema = z.object({
    id: z.uuid(),
    vegId: z.uuid(),
    vegName: z.string(),
    vegNameInHindi: z.string().nullable(),
    vegImage: z.string().nullable(),
    quantityKg: z.number(),
    status: z.enum(["pending", "collected"]),
    shopName: z.string(),
    shopAddress: z.string(),
    updatedAt: z.string().nullable(),
})

export type TPickupItem = z.infer<typeof ZPickupItemSchema>
