import { initTRPC } from "@trpc/server"
import type { Context } from "./context"
import { ZodError } from "zod"

export const t = initTRPC.context<Context>().create({
    errorFormatter({ shape, error }) {
        if (error.cause instanceof ZodError) {
            return {
                ...shape,
                message: error.cause.issues[0]?.message ?? shape.message,
            }
        }

        return shape
    },
})
