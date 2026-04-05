import { TRPCError } from "@trpc/server"
import { type Context } from "../../trpc"
import { rateLimit } from "../../utils"
import { type TLoginSchema } from "./auth.schema"
import { findAdminByPhone } from "./auth.service"
import { generateAdminAccessToken } from "../../utils/tokens"
import { logger } from "../../configs"

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
        if (adminExists.pin !== input.pin) {
            throw new TRPCError({
                message: "Invalid pin",
                code: "UNAUTHORIZED",
            })
        }

        // generate access token and refresh token
        const accessToken = generateAdminAccessToken({ id: adminExists.id })

        // set headers
        ctx.res.setHeader("Authorization", `Bearer ${accessToken}`)

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
