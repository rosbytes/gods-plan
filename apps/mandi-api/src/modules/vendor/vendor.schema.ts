import { z } from "zod"

export const ZGetSlotOrders = z.object({
    slotId: z.string(),
})

export type TGetSlotOrders = z.infer<typeof ZGetSlotOrders>

export const ZGetGroupedOrders = z.object({
    date: z.string(),
})

export type TGetGroupedOrders = z.infer<typeof ZGetGroupedOrders>
