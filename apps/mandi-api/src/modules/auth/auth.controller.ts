import { TRPCError } from "@trpc/server"
import { type Context } from "../../trpc"
// import { rateLimit } from "../../utils"
import { type TLoginSchema } from "./auth.schema"
import { findMandiVendorByPhone } from "./auth.service"
import { generateAccessToken } from "../../utils/tokens"
import { logger } from "../../configs"
import { compareMandiVendorPassword } from "@ros/commons"

export async function login({ input, ctx: _ctx }: { input: TLoginSchema; ctx: Context }) {
    try {
        // await rateLimit(`rateLimit:login:ip:${ctx.req.ip}`, 5, 60)
        // await rateLimit(`rateLimit:login:phone:${input.phone}`, 2, 120)

        // check if admin already exists
        const vendorExists = await findMandiVendorByPhone({ phone: input.phone })
        if (!vendorExists) {
            throw new TRPCError({
                message: "Admin not available",
                code: "UNAUTHORIZED",
            })
        }

        // check if admin pin is correct
        if (!compareMandiVendorPassword(input.pin, vendorExists.pin!)) {
            throw new TRPCError({
                message: "Invalid pin",
                code: "UNAUTHORIZED",
            })
        }

        // generate access token and refresh token
        const accessToken = generateAccessToken({ id: vendorExists.id })

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

// TODO: forget password
