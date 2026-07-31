import { publicProcedure, router } from "./globals"
import { z } from "zod"
import { authRouter } from "../module/auth/auth.route"
import { storeRouter } from "../module/store/store.route"
import { vendorRouter } from "../module/vendor/vendor.route"
import { paymentRouter } from "../module/payment/payment.route"
import { cityRouter } from "../module/city/city.route"
import { mandiRouter } from "../module/mandi/mandi.route"
import { vegRouter } from "../module/veg/veg.route"
import { otpRouter } from "../module/otp/otp.route"

// Define a simple router
export const appRouter = router({
    // initial setup testing procedure/endpoint
    greeting: publicProcedure.input(z.object({ name: z.string() })).query(({ input }) => {
        return `Hello, ${input.name}! Welcome to tRPC`
    }),
    auth: authRouter,
    store: storeRouter,
    vendor: vendorRouter,
    payment: paymentRouter,
    city: cityRouter,
    mandi: mandiRouter,
    veg: vegRouter,
    otp: otpRouter,
})

// Export type definition of API
export type AppRouter = typeof appRouter
