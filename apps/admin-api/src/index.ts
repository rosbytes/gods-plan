import express from "express"
import { createExpressMiddleware } from "@trpc/server/adapters/express"
import { appRouter, createContext } from "./trpc"
import cors from "cors"
import { connectCache, env, logger } from "./configs"

import mediaRouter from "./module/media/media.router"
import { testDBConnection } from "@ros/db"

const app = express()

// TODO: enable trust proxy when using behind a proxy
app.set("trust proxy", false)

app.use(cors({ origin: [env.FRONTEND_URL], credentials: true }))

app.use(express.json())

app.get("/", (req, res) => {
    res.json({ message: "Server is working" })
})

app.get("/api", (req, res) => {
    res.json({ message: "Server is working at api" })
})

// media upload endpoint
app.use("/api/media", mediaRouter)

// tRPC endpoint
app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext }))

if (env.NODE_ENV !== "production") {
    app.listen(env.SERVER_PORT, () => {
        logger.info(`Server is running on port: ${env.SERVER_PORT}`)
        testDBConnection()
        connectCache()
    })
}

export default app
