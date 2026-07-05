import type { CreateExpressContextOptions } from "@trpc/server/adapters/express"
// import { db } from "../db/db"

import { type Request, type Response } from "express"

export const createContext = ({
    req,
    res,
}: CreateExpressContextOptions): {
    // db: typeof db
    req: Request
    res: Response
} => ({
    // db,
    req,
    res,
})

export type Context = Awaited<ReturnType<typeof createContext>>
