import { z } from "zod"

export const ZCreateVegSchema = z.object({
    name: z.string().min(1, "Vegetable name is required"),
    nameInHindi: z.string().optional(),
    vegPrimaryImage: z.string().optional(),
})
export type TCreateVegSchema = z.infer<typeof ZCreateVegSchema>

export const ZUpdateVegSchema = z.object({
    id: z.uuid("Invalid vegetable ID"),
    name: z.string().min(1).optional(),
    nameInHindi: z.string().optional(),
    vegPrimaryImage: z.string().optional(),
})
export type TUpdateVegSchema = z.infer<typeof ZUpdateVegSchema>

export const ZListVegsSchema = z.object({
    search: z.string().optional(),
})
export type TListVegsSchema = z.infer<typeof ZListVegsSchema>
