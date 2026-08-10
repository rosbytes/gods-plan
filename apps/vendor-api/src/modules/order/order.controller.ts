import { TRPCError } from "@trpc/server"
import {
    getCheckoutDetails,
    createRazorpayOrder,
    placeOrder,
    payOrder,
    getOrders,
    getOrderDetails,
} from "./order.service"
import { logger } from "../../configs/logger"
import type { VendorContext } from "../../middlewares/marketVendor"
import type { TPlaceOrderInput, TPayOrderInput } from "./order.schema"

export async function getCheckoutDetailsHandler(ctx: VendorContext) {
    try {
        const details = await getCheckoutDetails(ctx.id)
        return details
    } catch (error) {
        logger.error(error)
        const message = error instanceof Error ? error.message : "Failed to fetch checkout details"
        throw new TRPCError({
            message,
            code: message.includes("not found") ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function createRazorpayOrderHandler(ctx: VendorContext, orderId?: string) {
    try {
        const orderData = await createRazorpayOrder(ctx.id, orderId)
        return orderData
    } catch (error) {
        logger.error(error)
        const message = error instanceof Error ? error.message : "Failed to create payment order"
        throw new TRPCError({
            message,
            code: message.includes("empty") ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function placeOrderHandler(ctx: VendorContext, input: TPlaceOrderInput) {
    try {
        const result = await placeOrder(ctx.id, input)
        return result
    } catch (error) {
        logger.error(error)
        const message = error instanceof Error ? error.message : "Failed to place order"
        throw new TRPCError({
            message,
            code: message.includes("not found") ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function payOrderHandler(ctx: VendorContext, input: TPayOrderInput) {
    try {
        const result = await payOrder(ctx.id, input)
        return result
    } catch (error) {
        logger.error(error)
        const message = error instanceof Error ? error.message : "Failed to pay order"
        throw new TRPCError({
            message,
            code: message.includes("not found") ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function getOrdersHandler(
    ctx: VendorContext,
    input: { searchQuery?: string | undefined },
) {
    try {
        const orders = await getOrders(ctx.id, input)
        return orders
    } catch (error) {
        logger.error(error)
        const message = error instanceof Error ? error.message : "Failed to fetch orders"
        throw new TRPCError({
            message,
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function getOrderDetailsHandler(ctx: VendorContext, orderId: string) {
    try {
        const details = await getOrderDetails(ctx.id, orderId)
        return details
    } catch (error) {
        logger.error(error)
        const message = error instanceof Error ? error.message : "Failed to fetch order details"
        throw new TRPCError({
            message,
            code: message.includes("not found") ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        })
    }
}
