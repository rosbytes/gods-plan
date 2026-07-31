import { TRPCError } from "@trpc/server"
import { parseCookie } from "cookie"
import { type Context } from "../../trpc"
import { rateLimit } from "../../utils"
import { type TLoginSchema } from "./auth.schema"
import {
    findAdminById,
    findAdminByPhone,
    updateAdminLoginTime,
    updateAdminRefreshToken,
} from "./auth.service"
import {
    generateAdminAccessToken,
    generateAdminRefreshToken,
    verifyAdminRefreshToken,
} from "../../utils/tokens"
import { env, logger } from "../../configs"
import { compareAdminPassword } from "@ros/commons"

export async function login({ input, ctx }: { input: TLoginSchema; ctx: Context }) {
    try {
        await rateLimit(`rateLimit:login:ip:${ctx.req.ip}`, 5, 60)
        await rateLimit(`rateLimit:login:phone:${input.phone}`, 2, 120)

        // check if admin already exists
        const adminExists = await findAdminByPhone({ phone: input.phone })
        if (!adminExists) {
            throw new TRPCError({
                message: "Admin not available",
                code: "UNAUTHORIZED",
            })
        }

        // check if admin pin is correct
        if (!adminExists.pin || !compareAdminPassword(input.pin, adminExists.pin)) {
            throw new TRPCError({
                message: "Invalid pin",
                code: "UNAUTHORIZED",
            })
        }

        // TODO: current setup or flow of token generation and cookies
        // support one login at a time, to support multiple login
        // we need to store refresh token in a different table for different devices
        // also we need to store device info in that table or
        // we can share existing refresh token only while login instead of generating the new one.

        // generate access token and refresh token
        const accessToken = generateAdminAccessToken(adminExists.id)
        const refreshToken = generateAdminRefreshToken(adminExists.id)

        const isProd = env.NODE_ENV === "production"
        const secureFlag = isProd ? " Secure;" : ""

        // set headers
        ctx.res.setHeader("Authorization", `Bearer ${accessToken}`)
        ctx.res.setHeader("refreshToken", `${refreshToken}`)

        // set cookies
        ctx.res.setHeader("Set-Cookie", [
            `accessToken=${accessToken}; HttpOnly;${secureFlag} SameSite=Lax; Path=/; Max-Age=${60 * 15}`,
            `refreshToken=${refreshToken}; HttpOnly;${secureFlag} SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 30}`,
        ])

        updateAdminRefreshToken({ id: adminExists.id, token: refreshToken })
        updateAdminLoginTime({ id: adminExists.id })

        return { success: true, status: "200 Ok", message: "Login Successful" }
    } catch (error) {
        logger.error(error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Something Went Wrong",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function refresh(ctx: Context) {
    try {
        await rateLimit(`rateLimit:login:ip:${ctx.req.ip}`, 5, 60)
        // extract refresh token

        const cookies = parseCookie(ctx.req.headers.cookie ?? "")

        const refreshToken = cookies.refreshToken

        if (!refreshToken) {
            throw new TRPCError({
                message: "Refresh token not available",
                code: "UNAUTHORIZED",
            })
        }

        // verify refresh token
        const payload = verifyAdminRefreshToken(refreshToken)

        // check if admin already exists
        const adminExists = await findAdminById({ id: payload.id })

        if (!adminExists) {
            throw new TRPCError({
                message: "Admin not available",
                code: "UNAUTHORIZED",
            })
        }

        // check if refresh token match in db
        if (adminExists.refreshToken !== refreshToken) {
            throw new TRPCError({
                message: "Refresh token not available",
                code: "UNAUTHORIZED",
            })
        }

        // generate access token and refresh token
        const accessToken = generateAdminAccessToken(adminExists.id)
        const newRefreshToken = generateAdminRefreshToken(adminExists.id)

        const isProd = env.NODE_ENV === "production"
        const secureFlag = isProd ? " Secure;" : ""

        // set headers
        ctx.res.setHeader("Authorization", `Bearer ${accessToken}`)
        ctx.res.setHeader("refreshToken", `${newRefreshToken}`)

        // set cookies
        ctx.res.setHeader("Set-Cookie", [
            `accessToken=${accessToken}; HttpOnly;${secureFlag} SameSite=Lax; Path=/; Max-Age=${60 * 15}`,
            `refreshToken=${newRefreshToken}; HttpOnly;${secureFlag} SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 30}`,
        ])

        await updateAdminRefreshToken({ id: adminExists.id, token: newRefreshToken })

        return { success: true, status: "200 Ok", message: "Tokens Refreshed" }
    } catch (error) {
        logger.error(error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Something Went Wrong",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function logout({ ctx }: { ctx: Context }) {
    await rateLimit(`rateLimit:login:ip:${ctx.req.ip}`, 5, 60)

    // TODO: delete tokens from db as well

    const isProd = env.NODE_ENV === "production"
    const secureFlag = isProd ? " Secure;" : ""

    ctx.res.setHeader("Set-Cookie", [
        `accessToken=; HttpOnly;${secureFlag} SameSite=Lax; Path=/; Max-Age=0`,
        `refreshToken=; HttpOnly;${secureFlag} SameSite=Lax; Path=/; Max-Age=0`,
    ])

    return {
        success: true,
    }
}
