import { lazy } from "@trpc/server"
import { publicProcedure, router } from "./globals"
import { z } from "zod"

// Define a simple router
export const appRouter = router({
    // initial setup testing procedure/endpoint
    greeting: publicProcedure.input(z.object({ name: z.string() })).query(({ input }) => {
        return `Hello, ${input.name}! Welcome to tRPC`
    }),
    greetings: publicProcedure.query(() => {
        return `Hello, Welcome to tRPC`
    }),
    // Option 1: Short-hand when the module has exactly 1 router exported
    auth: lazy(() => import("../modules/auth/auth.route")),
    catalog: lazy(() => import("../modules/catalog/catalog.route")),
    cart: lazy(() => import("../modules/cart/cart.route")),
    order: lazy(() => import("../modules/order/order.route")),
    pickup: lazy(() => import("../modules/pickup/pickup.route")),
    // payment: paymentRouter,
})

// Export type definition of API
export type AppRouter = typeof appRouter
