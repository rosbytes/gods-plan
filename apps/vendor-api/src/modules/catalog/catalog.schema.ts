import { z } from "zod"

export const ZCatalogItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    nameInHindi: z.string().nullable(),
    vegPrimaryImage: z.string().nullable(),
    estimatedPrice: z.number(), // price in rupees
})

export type TCatalogItem = z.infer<typeof ZCatalogItemSchema>
