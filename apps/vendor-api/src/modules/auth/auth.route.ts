import { publicProcedure, router, vendorProcedure } from "../../trpc/globals"
import { login, logout, refresh, getMe, resetPin } from "./auth.controller"
import { ZLoginSchema, ZResetPinSchema } from "./auth.schema"

export const authRouter = router({
    login: publicProcedure.input(ZLoginSchema).mutation(login),

    resetPin: publicProcedure.input(ZResetPinSchema).mutation(resetPin),

    refresh: publicProcedure.mutation(refresh),

    logout: vendorProcedure.mutation(logout),

    me: vendorProcedure.query(({ ctx }) => getMe(ctx)),
})
