import { router, adminProcedure } from "../../trpc"
import {
    ZGetRegistrationFeeSchema,
    ZCreateOrderSchema,
    ZGetPaymentStatusSchema,
    ZVerifyPaymentSchema,
    ZSkipPaymentSchema,
} from "./payment.schema"
import {
    getRegistrationFee,
    createOrder,
    getPaymentStatus,
    verifyPayment,
    skipPayment,
} from "./payment.controller"

export const paymentRouter = router({
    getRegistrationFee: adminProcedure.input(ZGetRegistrationFeeSchema).query(getRegistrationFee),
    createOrder: adminProcedure.input(ZCreateOrderSchema).mutation(createOrder),
    getPaymentStatus: adminProcedure.input(ZGetPaymentStatusSchema).query(getPaymentStatus),
    verifyPayment: adminProcedure.input(ZVerifyPaymentSchema).mutation(verifyPayment),
    skipPayment: adminProcedure.input(ZSkipPaymentSchema).mutation(skipPayment),
})
