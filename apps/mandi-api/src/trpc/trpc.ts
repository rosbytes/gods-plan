import { initTRPC } from "@trpc/server"
import type { Context } from "./context"

// initilized the trpc with the Context's Structure
export const t = initTRPC.context<Context>().create()
