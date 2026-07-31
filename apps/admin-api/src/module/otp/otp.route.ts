import { router, adminProcedure } from "../../trpc"
import { ZVerifyAccessTokenSchema } from "./otp.schema"
import { verifyAccessToken } from "./otp.controller"

export const otpRouter = router({
    verifyAccessToken: adminProcedure.input(ZVerifyAccessTokenSchema).mutation(verifyAccessToken),
})
