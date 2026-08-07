import { z } from "zod"

export const ZUpdateCartItemInputSchema = z.object({
    mandiStoreId: z.uuid(),
    vegId: z.uuid(),
    quantityKg: z.number().min(0),
})

export type TUpdateCartItemInput = z.infer<typeof ZUpdateCartItemInputSchema>

export const ZCartItemSchema = z.object({
    id: z.uuid(),
    marketStoreId: z.uuid(),
    mandiStoreId: z.uuid(),
    vegId: z.uuid(),
    quantityKg: z.number(),
})

export type TCartItem = z.infer<typeof ZCartItemSchema>
