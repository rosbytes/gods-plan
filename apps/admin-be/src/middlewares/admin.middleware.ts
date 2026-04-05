import { t } from "../trpc/trpc"
import type { Context } from "../trpc"
import { TRPCError } from "@trpc/server"
import { verifyAdminAccessToken } from "../utils"

// Admin Auth Middleware
export const isAdmin = t.middleware(async ({ ctx, next }) => {
    const token = ctx.req.headers.authorization?.split(" ")[1]
    if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Missing token" })

    try {
        const decoded = verifyAdminAccessToken(token)
        return next({
            ctx: { admin: decoded },
        })
    } catch (err) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" })
    }
})

export type AdminContext = Context & { admin: { id: string } }
