import { z } from "zod"

// Schema for Vite env variables (VITE_ prefixed)
const envSchema = z.object({
    VITE_MSG91_WIDGET_ID: z.string().nonempty(),
    VITE_MSG91_TOKEN_AUTH: z.string().nonempty(),
    VITE_API_URL: z.url().nonempty(),
    VITE_APP_NAME: z.string().nonempty(),
})

const createEnv = (env: ImportMetaEnv) => {
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
export const env = createEnv(import.meta.env)
