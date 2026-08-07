import { vendorProcedure, router } from "../../trpc/globals"
import { z } from "zod"
import { getCartHandler, updateCartItemHandler } from "./cart.controller"
import { ZUpdateCartItemInputSchema, ZCartItemSchema } from "./cart.schema"

export const cartRouter = router({
    getCart: vendorProcedure
        .output(z.array(ZCartItemSchema))
        .query(({ ctx }) => getCartHandler(ctx)),

    updateItem: vendorProcedure
        .input(ZUpdateCartItemInputSchema)
        .mutation(({ ctx, input }) => updateCartItemHandler(ctx, input)),
})
