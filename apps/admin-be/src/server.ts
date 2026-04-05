import express from "express"
import { createExpressMiddleware } from "@trpc/server/adapters/express"
import { appRouter, createContext } from "./trpc"
import cors from "cors"
import { env, logger } from "./configs"

const app = express()

// TODO: enable trust proxy when using behind a proxy
app.set("trust proxy", false)

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Server is working")
})

// tRPC endpoint
app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext }))

app.listen(env.SERVER_PORT, async () => {
    logger.info(`Server is runnig on port: ${env.SERVER_PORT}, `)
    // await connectCache()
})
