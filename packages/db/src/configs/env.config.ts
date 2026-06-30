import "dotenv/config"
import * as z from "zod"
// Schema to parse Env Variable
const envSchema = z.object({
    DATABASE_URL: z.url(),
})

const createEnv = (env: NodeJS.ProcessEnv) => {
    // Parse Env
    const result = envSchema.safeParse(env)
    if (!result.success) {
        console.error("Failed to validate Env:", result.error)
        process.exit(1)
    }
    return result.data
}

// export safelyParsed env object
export const env = createEnv(process.env)
