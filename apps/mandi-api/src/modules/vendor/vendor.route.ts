import { router, vendorProcedure } from "../../trpc/globals"
import {
    getHomeStats,
    getProfile,
    getSlotOrders,
    getGroupedOrders,
    updatePrice,
    getFinanceStats,
    searchOrders,
} from "./vendor.controller"
import {
    ZGetSlotOrders,
    ZGetGroupedOrders,
    ZUpdatePrice,
    ZGetFinanceStats,
    ZSearchOrders,
} from "./vendor.schema"

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

    getFinanceStats: vendorProcedure.input(ZGetFinanceStats).query(async ({ input, ctx }) => {
        return getFinanceStats({
            vendorId: ctx.id,
            date: input.date,
        })
    }),

    searchOrders: vendorProcedure.input(ZSearchOrders).query(async ({ input, ctx }) => {
        return searchOrders({
            vendorId: ctx.id,
            query: input.query,
        })
    }),
})
