import { t } from "../trpc/trpc"
import type { Context } from "../trpc"
import { TRPCError } from "@trpc/server"
import { verifyAccessToken } from "../utils/tokens"
import { parseCookie } from "cookie"

export const isVendor = t.middleware(async ({ ctx, next }) => {
    const cookies = parseCookie(ctx.req.headers.cookie ?? "")
    const authHeader = ctx.req.headers.authorization
    const headerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader?.split(" ")[1]

    const token = cookies.accessToken ?? headerToken

    if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Missing token" })
    try {
        const decoded = verifyAccessToken(token)
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
