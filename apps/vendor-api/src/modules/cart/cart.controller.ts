import { TRPCError } from "@trpc/server"
import { getCartForVendor, updateCartItem } from "./cart.service"
import { logger } from "../../configs/logger"
import type { VendorContext } from "../../middlewares/marketVendor"
import type { TUpdateCartItemInput } from "./cart.schema"

export async function getCartHandler(ctx: VendorContext) {
    try {
        const cart = await getCartForVendor(ctx.id)
        return cart
    } catch (error) {
        logger.error(error)
        throw new TRPCError({
            message: "Failed to fetch cart",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function updateCartItemHandler(ctx: VendorContext, input: TUpdateCartItemInput) {
    try {
        await updateCartItem(ctx.id, input.mandiStoreId, input.vegId, input.quantityKg)
        return { success: true }
    } catch (error) {
        logger.error(error)
        const message = error instanceof Error ? error.message : "Failed to update cart"
        throw new TRPCError({
            message,
            code: message.includes("not found") ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        })
    }
}
