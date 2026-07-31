import { z } from "zod"

export const ZSaveStoreSchema = z.object({
    vendorId: z.uuid("Invalid vendor ID"),
    mandiId: z.uuid("Invalid mandi ID"),
    // cityId: z.uuid("Invalid city ID"),
    storeName: z.string().min(1),
    fullAddress: z.string().min(1),
    lat: z.number(),
    lng: z.number(),
})

export type TSaveStoreSchema = z.infer<typeof ZSaveStoreSchema>

export const ZCreateMandiStoreSchema = z.object({
    vendorId: z.uuid(),
    mandiId: z.uuid(),
    vegId: z.uuid(),
    storeName: z.string().min(1),
    fullAddress: z.string().min(1),
    lat: z.number(),
    lng: z.number(),
})

export type TCreateMandiStoreSchema = z.infer<typeof ZCreateMandiStoreSchema>

export const ZUpdateMandiStoreSchema = z.object({
    storeId: z.uuid(),
    mandiId: z.uuid().optional(),
    vegId: z.uuid().optional(),
    storeName: z.string().min(1).optional(),
    fullAddress: z.string().min(1).optional(),
    storeImage: z.url().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
})

export type TUpdateMandiStoreSchema = z.infer<typeof ZUpdateMandiStoreSchema>

export const ZCreateMarketStoreSchema = z.object({
    vendorId: z.uuid(),
    mandiId: z.uuid(),
    storeName: z.string().min(1),
    fullAddress: z.string().min(1),
    // storeImage: z.url(),
    lat: z.number(),
    lng: z.number(),
})

export type TCreateMarketStoreSchema = z.infer<typeof ZCreateMarketStoreSchema>

export const ZUpdateMarketStoreSchema = z.object({
    storeId: z.uuid(),
    mandiId: z.uuid().optional(),
    storeName: z.string().min(1).optional(),
    fullAddress: z.string().min(1).optional(),
    storeImage: z.url().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
})

export type TUpdateMarketStoreSchema = z.infer<typeof ZUpdateMarketStoreSchema>

export const ZSaveMandiStoreKycSchema = z.object({
    vendorId: z.uuid(),
    storeId: z.uuid(),
    docType: z.enum(["aadhar", "pan"]),
    docId: z.string().min(1),
    frontUrl: z.url(),
    backUrl: z.url(),
    storefrontUrl: z.url(),
})

export type TSaveMandiStoreKycSchema = z.infer<typeof ZSaveMandiStoreKycSchema>

export const ZSaveMarketStoreKycSchema = z.object({
    vendorId: z.uuid(),
    storeId: z.uuid(),
    docType: z.enum(["aadhar", "pan"]),
    docId: z.string().min(1),
    frontUrl: z.url(),
    backUrl: z.url(),
    storefrontUrl: z.url(),
})

export type TSaveMarketStoreKycSchema = z.infer<typeof ZSaveMarketStoreKycSchema>

export const ZSaveKycSchema = z.object({
    vendorId: z.uuid(),
    storeId: z.uuid(),
    docType: z.enum(["aadhar", "pan"]),
    docId: z.string().min(1),
    frontUrl: z.url(),
    backUrl: z.url(),
    storefrontUrl: z.url(),
})

export type TSaveKycSchema = z.infer<typeof ZSaveKycSchema>

export const ZGetKycSchema = z.object({
    vendorId: z.uuid(),
    storeId: z.uuid(),
})

export type TGetKycSchema = z.infer<typeof ZGetKycSchema>
