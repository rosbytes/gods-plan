import { z } from "zod"

export const ZCreateOrderSchema = z.object({
    storeId: z.uuid(),
    vendorId: z.uuid(),
    vendorType: z.enum(["market_vendor", "mandi_vendor"]),
})

export const ZGetPaymentStatusSchema = z.object({
    orderId: z.string(), // Razorpay order ID
    paymentId: z.string().optional(), // Razorpay payment ID (pay_xxx)
})

export const ZVerifyPaymentSchema = z.object({
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
    storeId: z.uuid(),
    vendorId: z.uuid(),
})

export const ZSkipPaymentSchema = z.object({
    storeId: z.uuid(),
    vendorId: z.uuid(),
    vendorType: z.enum(["market_vendor", "mandi_vendor"]),
    note: z.string().min(1, "Please enter a reason for skipping payment"),
})
