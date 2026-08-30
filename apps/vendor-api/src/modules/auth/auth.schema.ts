import { z } from "zod"

export const ZLoginSchema = z.object({
    phone: z.string().min(10).max(15),
    pin: z.string().length(4),
})

export type TLoginSchema = z.infer<typeof ZLoginSchema>

export const ZResetPinSchema = z.object({
    phone: z.string().min(10, "Phone number is required"),
    accessToken: z.string().min(1, "OTP verification token is required"),
    newPin: z.string().length(4, "PIN must be exactly 4 digits"),
})

export type TResetPinSchema = z.infer<typeof ZResetPinSchema>
