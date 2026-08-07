import { publicProcedure, router, vendorProcedure } from "../../trpc/globals"
import { login, logout, refresh } from "./auth.controller"
import { ZLoginSchema } from "./auth.schema"

export const authRouter = router({
    login: publicProcedure.input(ZLoginSchema).mutation(login),

    refresh: publicProcedure.mutation(refresh),

    logout: vendorProcedure.mutation(logout),
})
