import { vendorProcedure, router } from "../../trpc/globals"
import { z } from "zod"
import {
    getCheckoutDetailsHandler,
    createRazorpayOrderHandler,
    placeOrderHandler,
    payOrderHandler,
    getOrdersHandler,
    getOrderDetailsHandler,
} from "./order.controller"
import {
    ZCheckoutDetailsSchema,
    ZPlaceOrderInputSchema,
    ZPayOrderInputSchema,
    ZGetOrdersInputSchema,
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

    getOrders: vendorProcedure
        .input(ZGetOrdersInputSchema)
        .query(({ ctx, input }) => getOrdersHandler(ctx, input)),

    getOrderDetails: vendorProcedure
        .input(z.object({ orderId: z.string().uuid() }))
        .query(({ ctx, input }) => getOrderDetailsHandler(ctx, input.orderId)),
})
