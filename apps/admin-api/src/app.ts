import express from "express"
import { createExpressMiddleware } from "@trpc/server/adapters/express"
import { appRouter, createContext } from "./trpc"
import cors from "cors"
import { env, logger } from "./configs"

import mediaRouter from "./module/media/media.router"

const app = express()

// TODO: enable trust proxy when using behind a proxy
app.set("trust proxy", false)

app.use(cors({ origin: [env.FRONTEND_URL], credentials: true }))
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Server is working")
})

// media upload endpoint
app.use("/api/media", mediaRouter)

// tRPC endpoint
app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext }))

if (env.NODE_ENV !== "production") {
    app.listen(env.SERVER_PORT, async () => {
        logger.info(`Server is running on port: ${env.SERVER_PORT}`)
        // console.log(env.VERCEL)
        // console.log(env.SERVER_PORT)
        // await connectCache()
    })
}

export default app
