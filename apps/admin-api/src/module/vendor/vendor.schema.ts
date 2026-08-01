import { z } from "zod"

export const ZListVendorsSchema = z.object({
    search: z.string().optional(),
})
export type TListVendorsSchema = z.infer<typeof ZListVendorsSchema>

export const ZCreateMarketVendorSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    primaryPhone: z.string().min(10, "Valid mobile number required"),
    alternatePhone: z.string().optional(),
})
export type TCreateMarketVendorSchema = z.infer<typeof ZCreateMarketVendorSchema>

export const ZCreateMandiVendorSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    primaryPhone: z.string().min(10, "Valid mobile number required"),
    alternatePhone: z.string().optional(),
    // mandiId: z.uuid("Invalid mandi ID"),
})
export type TCreateMandiVendorSchema = z.infer<typeof ZCreateMandiVendorSchema>

export const ZGetVendorSchema = z.object({
    vendorId: z.uuid("Invalid vendor ID"),
})
export type TGetVendorSchema = z.infer<typeof ZGetVendorSchema>

export const ZDeleteVendorSchema = z.object({
    id: z.uuid("Invalid vendor ID"),
})
export type TDeleteVendorSchema = z.infer<typeof ZDeleteVendorSchema>

export const ZUpdateVendorSchema = z.object({
    vendorId: z.uuid("Invalid vendor ID"),
    fullName: z.string().min(1, "Full name is required").optional(),
    primaryPhone: z.string().min(10, "Valid mobile number required").optional(),
    alternatePhone: z.string().optional().nullable(),
    storeName: z.string().optional(),
    fullAddress: z.string().optional(),
})
export type TUpdateVendorSchema = z.infer<typeof ZUpdateVendorSchema>
