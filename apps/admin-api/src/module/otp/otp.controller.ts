import { TRPCError } from "@trpc/server"
import { msg91VerifyAccessToken } from "../../configs"
import type { AdminContext } from "../../middlewares"

// ─── Verify Access Token (MSG91 Widget) ───────────────────────────────────────
export const verifyAccessToken = async ({
    input,
}: {
    input: { accessToken: string }
    ctx: AdminContext
}) => {
    try {
        const result: any = await msg91VerifyAccessToken(input.accessToken)
        return { success: true, data: result }
    } catch (error: any) {
        console.error("[verifyAccessToken] MSG91 error:", error)
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: error?.message || "Access token verification failed",
            cause: error,
        })
    }
}
