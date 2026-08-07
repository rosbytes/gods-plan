import type { CreateExpressContextOptions } from "@trpc/server/adapters/express"

export const createContext = ({ req, res }: CreateExpressContextOptions) => {
    // TODO: We should also reconsider the request body here
    return {
        req,
        res,
    }
}

export type Context = Awaited<ReturnType<typeof createContext>>
