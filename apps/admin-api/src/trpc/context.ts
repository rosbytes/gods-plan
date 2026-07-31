import type { CreateExpressContextOptions } from "@trpc/server/adapters/express"
// import { db } from "@ros/db"

// import { type Request, type Response } from "express"

// interface ContextType {
//     // db: typeof db
//     req: Request
//     res: Response
// }

export const createContext = ({ req, res, info }: CreateExpressContextOptions) => ({
    // db,
    req,
    res,
})

export type Context = Awaited<ReturnType<typeof createContext>>
