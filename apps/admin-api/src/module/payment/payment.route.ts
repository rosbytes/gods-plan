import { router, adminProcedure } from "../../trpc"
import {
    ZCreateOrderSchema,
    ZGetPaymentStatusSchema,
    ZVerifyPaymentSchema,
    ZSkipPaymentSchema,
} from "./payment.schema"
import { createOrder, getPaymentStatus, verifyPayment, skipPayment } from "./payment.controller"

export const paymentRouter = router({
    createOrder: adminProcedure.input(ZCreateOrderSchema).mutation(createOrder),
    getPaymentStatus: adminProcedure.input(ZGetPaymentStatusSchema).query(getPaymentStatus),
    verifyPayment: adminProcedure.input(ZVerifyPaymentSchema).mutation(verifyPayment),
    skipPayment: adminProcedure.input(ZSkipPaymentSchema).mutation(skipPayment),
})
