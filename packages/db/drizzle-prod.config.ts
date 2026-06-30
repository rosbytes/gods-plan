import { defineConfig } from "drizzle-kit"
import { env } from "./src/configs"

export default defineConfig({
    out: "./migrations",
    schema: "./src/schema/*",
    dialect: "postgresql",
    dbCredentials: {
        url: env.DATABASE_URL,
    },
    casing: "snake_case",
    // extensionsFilters: ["postgis"],
    verbose: true,
    strict: true,
})
