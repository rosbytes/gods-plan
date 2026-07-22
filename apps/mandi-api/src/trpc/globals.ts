import { t } from "./trpc"
import { logger } from "../configs"
import { isVendor } from "../middlewares/mandiVendor"

// tRPC Logger for request and response duration, and path of the request
const trpcLogger = t.middleware(async ({ path, type, next }) => {
    const start = Date.now()
    const result = await next()
    const duration = Date.now() - start
    logger.info(`[tRPC] ${type} ${path} - ${duration}ms`)
    return result
})

// Rate limit placeholder middleware
const globalRateLimit = t.middleware(async ({ ctx: _ctx, next }) => {
    // TODO: Rate Limit Logic Here
    return next()
})

export const router = t.router
export const publicProcedure = t.procedure.use(trpcLogger).use(globalRateLimit)
export const vendorProcedure = publicProcedure.use(isVendor)
