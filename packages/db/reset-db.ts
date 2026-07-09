import postgres from "postgres"
import { env } from "./src/configs"

async function main() {
    console.log("🔄 Resetting database schema...")
    if (!env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is not set in env variables.")
        process.exit(1)
    }

    const client = postgres(env.DATABASE_URL)
    try {
        await client`DROP SCHEMA public CASCADE;`
        await client`CREATE SCHEMA public;`
        console.log("✅ Database schema public reset successfully.")
        await client.end()
        process.exit(0)
    } catch (error) {
        console.error("❌ Database reset failed:", error)
        await client.end()
        process.exit(1)
    }
}

main()
