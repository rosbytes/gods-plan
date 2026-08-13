import { z } from "zod"

export const ZGetSlotOrders = z.object({
    slotId: z.string(),
})

export type TGetSlotOrders = z.infer<typeof ZGetSlotOrders>

export const ZGetGroupedOrders = z.object({
    date: z.string(),
})

export type TGetGroupedOrders = z.infer<typeof ZGetGroupedOrders>

export const ZUpdatePrice = z.object({
    price: z.number().positive("Price must be greater than 0"),
})

export type TUpdatePrice = z.infer<typeof ZUpdatePrice>
