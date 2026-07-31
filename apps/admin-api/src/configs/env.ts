import "dotenv/config"
import * as z from "zod"
// Schema to parse Env Variable
const envSchema = z.object({
    SERVER_PORT: z.coerce.number<number>().default(3000),
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

    // MSG91 OTP
    MSG91_AUTH_KEY: z.string().nonempty(),

    VERCEL: z
        .string()
        .optional()
        .transform((value) => value === "1" || value === "true"),

    // AWS S3
    AWS_REGION: z.string().nonempty(),
    AWS_ACCESS_KEY_ID: z.string().nonempty(),
    AWS_SECRET_ACCESS_KEY: z.string().nonempty(),
    AWS_S3_BUCKET_NAME: z.string().nonempty(),

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
        const errorMessage = `Failed to validate Env: ${JSON.stringify(result.error.issues, null, 2)}`
        console.error(errorMessage)
        throw new Error(errorMessage)
    }
    return result.data
}

// export safelyParsed env object
export const env = createEnv(process.env)
