import "dotenv/config"
import * as z from "zod"
// Schema to parse Env Variable
const envSchema = z.object({
    SERVER_PORT: z.coerce.number<number>(),
    NODE_ENV: z.enum(["development", "production"], {
        error: (issue) => `NODE_ENV has to specified ${issue.values.join(" | ")}`,
    }),

    FRONTEND_URL: z.url(),
    DATABASE_URL: z.url(),
    REDIS_URL: z.url(),

    // Salt Only needed when hashing something like password etc.
    // SALT_ROUNDS: z.coerce.number<number>(),

    //  Admin Token Credentials
    ADMIN_JWT_ACCESS_TOKEN_SECRET: z.string().nonempty(),
    ADMIN_JWT_ACCESS_TOKEN_EXPIRY: z.string().nonempty(),
    ADMIN_JWT_REFRESH_TOKEN_SECRET: z.string().nonempty(),
    ADMIN_JWT_REFRESH_TOKEN_EXPIRY: z.string().nonempty(),

    // Cloudinary Credentials
    CLOUDINARY_CLOUD_NAME: z.string().nonempty(),
    CLOUDINARY_API_KEY: z.string().nonempty(),
    CLOUDINARY_API_SECRET: z.string().nonempty(),

    // Razorpay Credentials
    RAZORPAY_KEY_ID: z.string().nonempty(),
    RAZORPAY_KEY_SECRET: z.string().nonempty(),

    VERCEL: z.enum(["true", "false"]).transform((value) => value === "true"),

    //  User Token Credentials
    // USER_JWT_ACCESS_TOKEN_SECRET: z.string().nonempty(),
    // USER_JWT_ACCESS_TOKEN_EXPIRY: z.string().nonempty(),
    // USER_JWT_REFRESH_TOKEN_SECRET: z.string().nonempty(),
    // USER_JWT_REFRESH_TOKEN_EXPIRY: z.string().nonempty(),

    //  Vendor Token Credentials
    // VENDOR_JWT_ACCESS_TOKEN_SECRET: z.string().nonempty(),
    // VENDOR_JWT_ACCESS_TOKEN_EXPIRY: z.string().nonempty(),
    // VENDOR_JWT_REFRESH_TOKEN_SECRET: z.string().nonempty(),
    // VENDOR_JWT_REFRESH_TOKEN_EXPIRY: z.string().nonempty(),

    // Twilio Credentials
    // TWILIO_ACCOUNT_SID: z.string().nonempty(),
    // TWILIO_AUTH_TOKEN: z.string().nonempty(),
    // TWILIO_VIRTUAL_NUMBER: z.string().nonempty(),
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
