import { z } from "zod"
import { parsePhoneNumberFromString } from "libphonenumber-js"

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

/*
 *
 * Login Schema
 *
 * */
export const ZLoginSchema = z.object({
    phone: zPhone,
    pin: z.string().min(4).max(6),
})

export type TLoginSchema = z.infer<typeof ZLoginSchema>
