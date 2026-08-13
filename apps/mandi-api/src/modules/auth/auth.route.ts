import { db } from "@ros/db"
import { router, publicProcedure, vendorProcedure } from "../../trpc/globals"
import { ZLoginSchema } from "./auth.schema"

export const authRouter = router({
    // login
    login: publicProcedure.input(ZLoginSchema).mutation(async ({ input, ctx }) => {
        const { login } = await import("./auth.controller")
        return login({ input, ctx })
    }),

    refresh: publicProcedure.mutation(async ({ ctx }) => {
        const { refresh } = await import("./auth.controller")
        return refresh(ctx)
    }),

    me: vendorProcedure.query(async ({ ctx }) => {
        const { getProfile } = await import("../vendor/vendor.controller")
        return getProfile(ctx.id)
    }),

    logout: publicProcedure.mutation(async ({ ctx }) => {
        const { logout } = await import("./auth.controller")
        return logout({ ctx })
    }),

    // TODO: remove this endpoint, this one is unnnecessary and add health endpoints only
    test: publicProcedure.query(async () => {
        console.log("res")
        const res = await db.execute("SELECT 1")
        // db.execute("SELECT 1")
        console.log(res)
        return res
    }),
})
