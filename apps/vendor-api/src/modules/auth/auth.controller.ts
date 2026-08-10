import { TRPCError } from "@trpc/server"
import { parseCookie } from "cookie"
import { type Context } from "../../trpc"
import { type TLoginSchema } from "./auth.schema"
import { findMarketVendorByPhone, getMarketVendorById } from "./auth.service"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/tokens"
import { env, logger } from "../../configs"
import { compareMarketVendorPassword } from "@ros/commons"

export async function login({ input, ctx }: { input: TLoginSchema; ctx: Context }) {
    try {
        // check if vendor exists
        const vendorExists = await findMarketVendorByPhone({ phone: input.phone })
        if (!vendorExists) {
            throw new TRPCError({
                message: "Market vendor not found",
                code: "UNAUTHORIZED",
            })
        }

        // check if vendor pin is correct
        if (!compareMarketVendorPassword(input.pin, vendorExists.pin!)) {
            throw new TRPCError({
                message: "Invalid pin",
                code: "UNAUTHORIZED",
            })
        }

        // generate access token and refresh token
        const accessToken = generateAccessToken({ id: vendorExists.id })
        const refreshToken = generateRefreshToken({ id: vendorExists.id })

        const isProd = env.NODE_ENV === "production"
        const secureFlag = isProd ? " Secure;" : ""

        // set headers
        ctx.res.setHeader("Authorization", `Bearer ${accessToken}`)
        ctx.res.setHeader("refreshToken", `${refreshToken}`)

        // set HttpOnly cookies
        ctx.res.setHeader("Set-Cookie", [
            `accessToken=${accessToken}; HttpOnly;${secureFlag} SameSite=Lax; Path=/; Max-Age=${60 * 15}`,
            `refreshToken=${refreshToken}; HttpOnly;${secureFlag} SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 30}`,
        ])

        return { success: true, status: "200 Ok", message: "Login Successful", token: accessToken }
    } catch (error) {
        logger.error(error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Something Went Wrong",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function refresh({ ctx }: { ctx: Context }) {
    try {
        const cookies = parseCookie(ctx.req.headers.cookie ?? "")
        const refreshToken =
            cookies.refreshToken || (ctx.req.headers.refreshToken as string | undefined)

        if (!refreshToken) {
            throw new TRPCError({
                message: "Refresh token not available",
                code: "UNAUTHORIZED",
            })
        }

        // verify refresh token
        const payload = verifyRefreshToken(refreshToken)

        // check if vendor exists in database
        const vendorExists = await getMarketVendorById(payload.id)
        if (!vendorExists) {
            throw new TRPCError({
                message: "Market vendor not found",
                code: "UNAUTHORIZED",
            })
        }

        // generate new access token and refresh token
        const newAccessToken = generateAccessToken({ id: vendorExists.id })
        const newRefreshToken = generateRefreshToken({ id: vendorExists.id })

        const isProd = env.NODE_ENV === "production"
        const secureFlag = isProd ? " Secure;" : ""

        // set headers
        ctx.res.setHeader("Authorization", `Bearer ${newAccessToken}`)
        ctx.res.setHeader("refreshToken", `${newRefreshToken}`)

        // set HttpOnly cookies
        ctx.res.setHeader("Set-Cookie", [
            `accessToken=${newAccessToken}; HttpOnly;${secureFlag} SameSite=Lax; Path=/; Max-Age=${60 * 15}`,
            `refreshToken=${newRefreshToken}; HttpOnly;${secureFlag} SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 30}`,
        ])

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

export async function getMe(ctx: { id: string }) {
    if (!ctx.id) {
        throw new TRPCError({
            message: "Unauthorized access",
            code: "UNAUTHORIZED",
        })
    }
    const vendorRecord = await getMarketVendorById(ctx.id)
    if (!vendorRecord) {
        throw new TRPCError({
            message: "Vendor profile not found",
            code: "UNAUTHORIZED",
        })
    }
    return {
        id: vendorRecord.id,
        fullName: vendorRecord.fullName,
        phone: vendorRecord.primaryPhone,
    }
}
