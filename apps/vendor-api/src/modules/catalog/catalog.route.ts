import { vendorProcedure, router } from "../../trpc/globals"
import { getVegetablesHandler } from "./catalog.controller"

export const catalogRouter = router({
    getVegetables: vendorProcedure.query(({ ctx }) => getVegetablesHandler(ctx)),
})
