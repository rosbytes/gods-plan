import { TRPCError } from "@trpc/server"
import { getPickupItems } from "./pickup.service"
import { logger } from "../../configs/logger"
import type { VendorContext } from "../../middlewares/marketVendor"
import { findVendorStore } from "../catalog/catalog.service"

export async function getPickupItemsHandler(ctx: VendorContext) {
    try {
        const store = await findVendorStore(ctx.id)

        if (!store) {
            throw new TRPCError({
                message: "Vendor store not found",
                code: "NOT_FOUND",
            })
        }
        const items = await getPickupItems(store.id, store.mandiId)
        return items
    } catch (error) {
        logger.error(error)
        const message = error instanceof Error ? error.message : "Failed to fetch pickup items"
        throw new TRPCError({
            message,
            code: message.includes("not found") ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        })
    }
}
