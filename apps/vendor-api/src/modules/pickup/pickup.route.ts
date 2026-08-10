import { vendorProcedure, router } from "../../trpc/globals"
import { getPickupItemsHandler } from "./pickup.controller"

export const pickupRouter = router({
    getPickupItems: vendorProcedure.query(({ ctx }) => getPickupItemsHandler(ctx)),
})
