import { vendorProcedure, router } from "../../trpc/globals"
import { z } from "zod"
import {
    getCheckoutDetailsHandler,
    createRazorpayOrderHandler,
    placeOrderHandler,
    payOrderHandler,
} from "./order.controller"
import {
    ZCheckoutDetailsSchema,
    ZPlaceOrderInputSchema,
    ZPayOrderInputSchema,
} from "./order.schema"

export const orderRouter = router({
    getCheckoutDetails: vendorProcedure
        .output(ZCheckoutDetailsSchema)
        .query(({ ctx }) => getCheckoutDetailsHandler(ctx)),

    createRazorpayOrder: vendorProcedure
        .input(z.object({ orderId: z.uuid().optional() }))
        .output(z.object({ orderId: z.string(), amount: z.number() }))
        .mutation(({ ctx, input }) => createRazorpayOrderHandler(ctx, input.orderId)),

    placeOrder: vendorProcedure
        .input(ZPlaceOrderInputSchema)
        .mutation(({ ctx, input }) => placeOrderHandler(ctx, input)),

    payOrder: vendorProcedure
        .input(ZPayOrderInputSchema)
        .mutation(({ ctx, input }) => payOrderHandler(ctx, input)),
})
