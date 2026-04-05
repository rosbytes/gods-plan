import { publicProcedure, router } from "./globals"
import { z } from "zod"

// Define a simple router
export const appRouter = router({
    // initial setup testing procedure/endpoint
    greeting: publicProcedure.input(z.object({ name: z.string() })).query(({ input }) => {
        return `Hello, ${input.name}! Welcome to tRPC`
    }),
})

// Export type definition of API
export type AppRouter = typeof appRouter
