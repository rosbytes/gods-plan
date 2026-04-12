import { z } from "zod"

export const ZCreateOrderSchema = z.object({
    storeId: z.string().uuid(),
    vendorId: z.string().uuid(),
})

export const ZGetPaymentStatusSchema = z.object({
    orderId: z.string(), // Razorpay order ID
})

export const ZVerifyPaymentSchema = z.object({
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
    storeId: z.string().uuid(),
    vendorId: z.string().uuid(),
})
