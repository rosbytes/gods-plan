import { router, publicProcedure } from "../../trpc"
import { ZLoginSchema } from "./auth.schema"

export const authRouter = router({
    // login
    login: publicProcedure.input(ZLoginSchema).mutation(async ({ input, ctx }) => {
        const { login } = await import("./auth.controller")
        return login({ input, ctx })
    }),
})
