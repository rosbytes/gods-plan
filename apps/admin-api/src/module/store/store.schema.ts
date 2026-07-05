import { z } from "zod"

export const ZSaveStoreSchema = z.object({
    vendorId: z.string().uuid("Invalid vendor ID"),
    storeName: z.string().min(1),
    fullAddress: z.string().min(1),
    lat: z.number(),
    lng: z.number(),
})

export type TSaveStoreSchema = z.infer<typeof ZSaveStoreSchema>

export const ZSaveKycSchema = z.object({
    vendorId: z.string().uuid(),
    storeId: z.string().uuid(),
    docType: z.enum(["aadhar", "pan"]),
    docId: z.string().min(1),
    frontUrl: z.string().url(),
    backUrl: z.string().url(),
    storefrontUrl: z.string().url(),
})

export type TSaveKycSchema = z.infer<typeof ZSaveKycSchema>

export const ZGetKycSchema = z.object({
    vendorId: z.string().uuid(),
    storeId: z.string().uuid(),
})

export type TGetKycSchema = z.infer<typeof ZGetKycSchema>
