import { initTRPC } from "@trpc/server"
import type { Context } from "./context"
import { ZodError } from "zod"

export const t = initTRPC.context<Context>().create({
    errorFormatter({ shape, error }) {
        if (error.cause instanceof ZodError) {
            const message =
                error.cause.issues.length > 0
                    ? error.cause.issues.map((issue) => issue.message).join(", ")
                    : shape.message

            return {
                ...shape,
                message,
            }
        }

        return shape
    },
})
