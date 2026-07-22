import { t } from "../trpc/trpc"
import type { Context } from "../trpc"
import { TRPCError } from "@trpc/server"
import { verifyAccessToken } from "../utils/tokens"

export const isVendor = t.middleware(async ({ ctx, next }) => {
    const token = ctx.req.headers.authorization?.split(" ")[1]
    if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Missing token" })
    try {
        const decoded = verifyAccessToken(token)
        // Don't make call to db, use something like in memory storage, may be redis.
        // const [vendor] = await db.select().from(mandiVendor).where(eq(mandiVendor.id, decoded.id))

        // if (!vendor) {
        //     throw new TRPCError({
        //         code: "UNAUTHORIZED",
        //         message: "Mandi vendor not found",
        //     })
        // }

        return next({
            ctx: {
                ...ctx,
                id: decoded.id,
            },
        })
    } catch (e) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired token",
        })
    }
})

export type VendorContext = Context & { id: string }
