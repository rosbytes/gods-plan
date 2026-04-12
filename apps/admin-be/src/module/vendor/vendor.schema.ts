import { z } from "zod"

export const ZListVendorsSchema = z.object({
    search: z.string().optional(),
})
export type TListVendorsSchema = z.infer<typeof ZListVendorsSchema>

export const ZCreateVendorSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    primaryPhone: z.string().min(10, "Valid mobile number required"),
    alternatePhone: z.string().optional(),
    type: z.enum(["market_vendor", "mandi_vendor"]),
})
export type TCreateVendorSchema = z.infer<typeof ZCreateVendorSchema>

export const ZGetVendorSchema = z.object({
    vendorId: z.string().uuid("Invalid vendor ID"),
})
export type TGetVendorSchema = z.infer<typeof ZGetVendorSchema>
