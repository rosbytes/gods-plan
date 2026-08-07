import { TRPCError } from "@trpc/server"
import { availableVegiesInMandi, findVendorStore } from "./catalog.service"
import { logger } from "../../configs/logger"
import type { VendorContext } from "../../middlewares/marketVendor"

export async function getVegetablesHandler(ctx: VendorContext) {
    try {
        const store = await findVendorStore(ctx.id)

        if (!store) {
            throw new TRPCError({
                message: "Vendor store not found",
                code: "NOT_FOUND",
            })
        }

        const vegies = await availableVegiesInMandi(store.mandiId)

        return vegies
    } catch (error) {
        logger.error(error)
        throw new TRPCError({
            message: "Failed to fetch vegetable catalog",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}
