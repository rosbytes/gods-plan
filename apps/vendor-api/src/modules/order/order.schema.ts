import { z } from "zod"

export const ZPlaceOrderInputSchema = z.object({
    paymentMethod: z.enum(["pay_online", "pay_at_pickup"]),
    idempotencyKey: z.string(),
    paymentDetails: z
        .object({
            razorpayOrderId: z.string(),
            razorpayPaymentId: z.string(),
            razorpaySignature: z.string(),
        })
        .optional(),
})

export type TPlaceOrderInput = z.infer<typeof ZPlaceOrderInputSchema>

export const ZCheckoutDetailsSchema = z.object({
    mandiName: z.string(),
    mandiAddress: z.string(),
    slot: z.number(),
    slotTime: z.string(),
})

export type TCheckoutDetails = z.infer<typeof ZCheckoutDetailsSchema>

export const ZPayOrderInputSchema = z.object({
    orderId: z.uuid(),
    idempotencyKey: z.string(),
    paymentDetails: z.object({
        razorpayOrderId: z.string(),
        razorpayPaymentId: z.string(),
        razorpaySignature: z.string(),
    }),
})

export type TPayOrderInput = z.infer<typeof ZPayOrderInputSchema>

export const ZGetOrdersInputSchema = z.object({
    searchQuery: z.string().optional(),
})

export type TGetOrdersInput = z.infer<typeof ZGetOrdersInputSchema>

export const ZGetOrderDetailsInputSchema = z.object({
    orderId: z.string().uuid(),
})

export type TGetOrderDetailsInput = z.infer<typeof ZGetOrderDetailsInputSchema>
