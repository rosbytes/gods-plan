import { router, publicProcedure } from "../../trpc"
import { ZCreateOrderSchema, ZGetPaymentStatusSchema, ZVerifyPaymentSchema } from "./payment.schema"
import { createOrder, getPaymentStatus, verifyPayment } from "./payment.controller"

export const paymentRouter = router({
    createOrder: publicProcedure.input(ZCreateOrderSchema).mutation(createOrder),
    getPaymentStatus: publicProcedure.input(ZGetPaymentStatusSchema).query(getPaymentStatus),
    verifyPayment: publicProcedure.input(ZVerifyPaymentSchema).mutation(verifyPayment),
})
