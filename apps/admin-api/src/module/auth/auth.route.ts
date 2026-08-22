import { router, publicProcedure, adminProcedure } from "../../trpc"
import { ZLoginSchema, ZResetPinSchema } from "./auth.schema"

export const authRouter = router({
    // login
    login: publicProcedure.input(ZLoginSchema).mutation(async ({ input, ctx }) => {
        const { login } = await import("./auth.controller")
        return login({ input, ctx })
    }),
    resetPin: publicProcedure.input(ZResetPinSchema).mutation(async ({ input, ctx }) => {
        const { resetPin } = await import("./auth.controller")
        return resetPin({ input, ctx })
    }),
    refresh: publicProcedure.mutation(async ({ ctx }) => {
        const { refresh } = await import("./auth.controller")
        return refresh(ctx)
    }),
    me: adminProcedure.query(async ({ ctx }) => {
        const { getMe } = await import("./auth.controller")
        return getMe(ctx)
    }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
        const { logout } = await import("./auth.controller")
        return logout({ ctx })
    }),
})
