import { z } from "zod"

export const ZCreateCitySchema = z.object({
    name: z.string().min(1, "City name is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().optional(),
    cityImage: z.string().optional(),
})
export type TCreateCitySchema = z.infer<typeof ZCreateCitySchema>

export const ZUpdateCitySchema = z.object({
    id: z.uuid("Invalid city ID"),
    name: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
    pincode: z.string().optional(),
    cityImage: z.string().optional(),
})
export type TUpdateCitySchema = z.infer<typeof ZUpdateCitySchema>

export const ZListCitiesSchema = z.object({
    search: z.string().optional(),
})
export type TListCitiesSchema = z.infer<typeof ZListCitiesSchema>

export const ZDeleteCitySchema = z.object({
    id: z.uuid("Invalid city ID"),
})
export type TDeleteCitySchema = z.infer<typeof ZDeleteCitySchema>
