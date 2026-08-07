import "dotenv/config"
import * as z from "zod"
// Schema to parse Env Variable
const envSchema = z.object({
    SERVER_PORT: z.coerce.number().int().min(1).max(65535).default(3000),

    FRONTEND_URL: z.url(),
    DATABASE_URL: z.url(),

    NODE_ENV: z.enum(["development", "production"]),

    VERCEL: z
        .string()
        .optional()
        .transform((value) => value === "1" || value === "true"),

    // Tokens
    MARKET_JWT_ACCESS_TOKEN_SECRET: z.string().nonempty(),
    MARKET_JWT_ACCESS_TOKEN_EXPIRY: z.string().nonempty(),
    MARKET_JWT_REFRESH_TOKEN_SECRET: z.string().nonempty(),
    MARKET_JWT_REFRESH_TOKEN_EXPIRY: z.string().nonempty(),

    // AWS S3
    AWS_REGION: z.string().nonempty(),
    AWS_ACCESS_KEY_ID: z.string().nonempty(),
    AWS_SECRET_ACCESS_KEY: z.string().nonempty(),
    AWS_S3_BUCKET_NAME: z.string().nonempty(),
})

const createEnv = (env: NodeJS.ProcessEnv) => {
    // Parse Env
    const result = envSchema.safeParse(env)
    if (!result.success) {
        const errorMessage = `Failed to validate Env: ${JSON.stringify(result.error.issues, null, 2)}`
        console.error(errorMessage)
        throw new Error(errorMessage)
    }
    return result.data
}

// export safelyParsed env object
export const env = createEnv(process.env)
