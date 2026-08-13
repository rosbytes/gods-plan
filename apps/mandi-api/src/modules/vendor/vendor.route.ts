import { router, vendorProcedure } from "../../trpc/globals"
import {
    getHomeStats,
    getProfile,
    getSlotOrders,
    getGroupedOrders,
    updatePrice,
} from "./vendor.controller"
import { ZGetSlotOrders, ZGetGroupedOrders, ZUpdatePrice } from "./vendor.schema"

export const vendorRouter = router({
    getHomeStats: vendorProcedure.query(async ({ ctx }) => {
        return getHomeStats({ vendorId: ctx.id })
    }),

    getSlotOrders: vendorProcedure.input(ZGetSlotOrders).query(async ({ input, ctx }) => {
        return getSlotOrders({
            vendorId: ctx.id,
            slotId: input.slotId,
        })
    }),

    getGroupedOrders: vendorProcedure.input(ZGetGroupedOrders).query(async ({ input, ctx }) => {
        return getGroupedOrders({
            vendorId: ctx.id,
            date: input.date,
        })
    }),

    getProfile: vendorProcedure.query(async ({ ctx }) => {
        return getProfile(ctx.id)
    }),

    updatePrice: vendorProcedure.input(ZUpdatePrice).mutation(async ({ input, ctx }) => {
        return updatePrice({
            vendorId: ctx.id,
            price: input.price,
        })
    }),
})
