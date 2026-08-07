import { publicProcedure, router } from "./globals"
import { z } from "zod"
import { authRouter } from "../modules/auth/auth.route"
import { catalogRouter } from "../modules/catalog/catalog.route"
import { cartRouter } from "../modules/cart/cart.route"
import { orderRouter } from "../modules/order/order.route"

// Define a simple router
export const appRouter = router({
    // initial setup testing procedure/endpoint
    greeting: publicProcedure.input(z.object({ name: z.string() })).query(({ input }) => {
        return `Hello, ${input.name}! Welcome to tRPC`
    }),
    greetings: publicProcedure.query(() => {
        return `Hello, Welcome to tRPC`
    }),
    auth: authRouter,
    catalog: catalogRouter,
    cart: cartRouter,
    order: orderRouter,
    // payment: paymentRouter,
})

// Export type definition of API
export type AppRouter = typeof appRouter
