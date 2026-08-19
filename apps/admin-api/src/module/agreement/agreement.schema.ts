import { z } from "zod"

export const ZSignAgreementSchema = z.object({
    vendorId: z.uuid("Invalid vendor ID"),
    storeId: z.uuid("Invalid store ID"),
    type: z.enum(["market", "mandi"]),
    signerName: z.string().min(1, "Signer name is required"),
    signerPhone: z.string().min(1, "Signer phone is required"),
    verificationMethod: z.string().default("otp"),
    verificationIdentifier: z.string().optional(),
    title: z.string().default("NON-DISCLOSURE & PRE-COLLABORATION INTENT AGREEMENT"),
    version: z.string().default("1.0"),
    termsSnapshot: z.string().optional(),
    signedPdfUrl: z.url("Invalid PDF URL").optional().nullable(),
})

export type TSignAgreementSchema = z.infer<typeof ZSignAgreementSchema>

export const ZGetStoreAgreementSchema = z.object({
    vendorId: z.uuid("Invalid vendor ID"),
    storeId: z.uuid("Invalid store ID"),
    type: z.enum(["market", "mandi"]),
})

export type TGetStoreAgreementSchema = z.infer<typeof ZGetStoreAgreementSchema>

export const ZGetAgreementByIdSchema = z.object({
    agreementId: z.uuid("Invalid agreement ID"),
    type: z.enum(["market", "mandi"]),
})

export type TGetAgreementByIdSchema = z.infer<typeof ZGetAgreementByIdSchema>
