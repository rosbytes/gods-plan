import { isAdmin } from "../middlewares"
import { t } from "./trpc"
// import { tokenBucket } from "../utils"
// import { logger } from "../configs"
// import { isUser, isVendor, isBoard } from "../middlewares"

// tRPC Logger for request and response duration, and path of the request
const trpcLogger = t.middleware(async ({ path, type, next }) => {
    const start = Date.now()
    const result = await next()
    const duration = Date.now() - start
    // logger.info(`[tRPC] ${type} ${path} - ${duration}ms`)
    return result
})

// TODO: Review this token Bucket limitter, It is written by AI.
const globalRateLimit = t.middleware(async ({ ctx, next }) => {
    // Global limit: 50 capacity, refill 25 tokens every 30 seconds
    // await tokenBucket(`rateLimit:global:ip:${ctx.req.ip}`, 50, 25, 30)
    return next()
})

export const router = t.router
export const publicProcedure = t.procedure.use(trpcLogger).use(globalRateLimit)
export const adminProcedure = publicProcedure.use(isAdmin)
// export const userProcedure = publicProcedure.use(isUser)
// export const vendorProcedure = publicProcedure.use(isVendor)
// export const boardProcedure = publicProcedure.use(isBoard)
