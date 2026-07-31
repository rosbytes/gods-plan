import { t } from "../trpc/trpc"
import type { Context } from "../trpc"
import { TRPCError } from "@trpc/server"
import { verifyAdminAccessToken } from "../utils"
import { parse } from "cookie"
import type { Request, Response, NextFunction } from "express"

// Admin Auth Middleware (tRPC)
export const isAdmin = t.middleware(async ({ ctx, next }) => {
    // cookies parsed
    const cookies = parse(ctx.req.headers.cookie ?? "")

    // auth header
    const authHeader = ctx.req.headers.authorization
    const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined

    // token extracted
    const token = cookies.accessToken ?? headerToken

    if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Missing token" })

    try {
        const decoded = verifyAdminAccessToken(token)
        return next({
            ctx: { ...ctx, admin: decoded },
        })
    } catch (err) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" })
    }
})

export type AdminContext = Context & { admin: ReturnType<typeof verifyAdminAccessToken> }

// Admin Auth Middleware (Express)
export const expressIsAdmin = (
    req: AuthenticatedAdminRequest,
    res: Response,
    next: NextFunction,
) => {
    const cookies = parse(req.headers.cookie ?? "")
    const authHeader = req.headers.authorization
    const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined

    const token = cookies.accessToken ?? headerToken

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized: Missing token" })
    }

    try {
        const decoded = verifyAdminAccessToken(token)
        req.admin = decoded
        next()
    } catch (err) {
        return res
            .status(401)
            .json({ success: false, message: "Unauthorized: Invalid or expired token" })
    }
}

export interface AuthenticatedAdminRequest extends Request {
    admin?: ReturnType<typeof verifyAdminAccessToken>
}
