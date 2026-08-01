import { z } from "zod"

export const ZCreateMandiSchema = z.object({
    name: z.string().min(1, "Mandi name is required"),
    cityId: z.uuid("Invalid city ID"),
    lat: z.number(),
    lng: z.number(),
    fullAddress: z.string().optional(),
    mandiImage: z.string().optional(),
})
export type TCreateMandiSchema = z.infer<typeof ZCreateMandiSchema>

export const ZUpdateMandiSchema = z.object({
    id: z.uuid("Invalid mandi ID"),
    name: z.string().min(1).optional(),
    cityId: z.uuid().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    fullAddress: z.string().optional(),
    mandiImage: z.string().optional(),
})
export type TUpdateMandiSchema = z.infer<typeof ZUpdateMandiSchema>

export const ZListMandisSchema = z.object({
    search: z.string().optional(),
    cityId: z.uuid().optional(),
})
export type TListMandisSchema = z.infer<typeof ZListMandisSchema>

export const ZDeleteMandiSchema = z.object({
    id: z.uuid("Invalid mandi ID"),
})
export type TDeleteMandiSchema = z.infer<typeof ZDeleteMandiSchema>
