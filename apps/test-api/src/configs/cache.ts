// import { createClient } from "redis"
// import { env } from "./env"

// export type RedisClient = ReturnType<typeof createClient>

// export const cache: RedisClient = createClient({
//     url: env.REDIS_URL,
// })

// cache.on("error", (err) => {
//     console.error("Redis Client Error", err)
// })

// export async function connectCache() {
//     if (!cache.isOpen) {
//         await cache.connect()
//         console.log("Cache Connected")
//     }
// }
