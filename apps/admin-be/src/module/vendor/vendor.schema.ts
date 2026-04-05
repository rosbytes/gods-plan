import { z } from "zod"
import { parsePhoneNumberFromString } from "libphonenumber-js"
import { ZVendorType } from "../../db"
import { ZKycDocType } from "../../db/schema/kycDocs"

// Phone number schema
const zPhone = z
    .string({ error: "Phone number is required" })
    .trim()
    .superRefine((val, ctx) => {
        const phoneNumber = parsePhoneNumberFromString(val)
        if (!phoneNumber || !phoneNumber.isValid()) {
            ctx.addIssue({
                code: "custom",
                message: "Invalid phone number. Please include country code (e.g. +91...)",
            })
        }
    })
    .transform((val) => {
        const phoneNumber = parsePhoneNumberFromString(val)
        return phoneNumber?.format("E.164") as string
    })

const zLat = z.number().min(-90).max(90)
const zLng = z.number().min(-180).max(180)

/*
 *
 * Create Vendor Schema
 *
 * */
export const ZCreateVendorSchema = z.object({
    fullName: z.string().min(3).max(100),
    // storeName: z.string().min(3).max(100),
    primaryPhone: zPhone,
    alternatePhone: zPhone.optional(),
    vendorType: ZVendorType,
})

export type TCreateVendorSchema = z.infer<typeof ZCreateVendorSchema>

/*
 *
 * Create Store Schema
 *
 * */
export const ZCreateStoreSchema = z.object({
    storeName: z.string().min(3).max(100),
    fullAddress: z.string().min(3).max(500),
    lat: zLat,
    lng: zLng,
})

export type TCreateStoreSchema = z.infer<typeof ZCreateStoreSchema>

/*
 *
 * Vendor Kyc Schema
 *
 * */
export const ZVendorKycSchema = z.object({
    docType: ZKycDocType,
    docNumber: z.string().min(3).max(100),
    frontImage: z.string().min(3).max(500),
    backImage: z.string().min(3).max(500),
})

export type TVendorKycSchema = z.infer<typeof ZVendorKycSchema>
