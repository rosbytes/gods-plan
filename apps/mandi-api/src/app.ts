import express, { type Express } from "express"
import { createExpressMiddleware } from "@trpc/server/adapters/express"
import { appRouter, createContext } from "./trpc"
import cors from "cors"
import { env, logger } from "./configs"
import { testDBConnection } from "@ros/db"

const app: Express = express()

// TODO: enable trust proxy when using behind a proxy
app.set("trust proxy", false)

app.use(cors({ origin: [env.FRONTEND_URL], credentials: true }))
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Server is working")
})

app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext }))

if (env.NODE_ENV !== "production") {
    app.listen(env.SERVER_PORT, () => {
        logger.info(`Server is running on port: ${env.SERVER_PORT}`)
        testDBConnection()
        // await connectCache()
    })
}

export default app
