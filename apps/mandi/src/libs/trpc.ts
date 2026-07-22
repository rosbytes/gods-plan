import { createTRPCReact } from "@trpc/react-query"
import type { AppRouter } from "../../../mandi-api/src/trpc/appRouter"
import { httpBatchLink } from "@trpc/client"

export const trpc = createTRPCReact<AppRouter>()

// Create the client
export const trpcClient = trpc.createClient({
    links: [
        httpBatchLink({
            url: `${import.meta.env.VITE_API_URL}/trpc`, // backend tRPC endpoint
            headers() {
                try {
                    // TODO: better accept the cookies
                    const storeData = localStorage.getItem("mandi-store")
                    if (storeData) {
                        const parsed = JSON.parse(storeData)
                        const token = parsed.state?.user?.token
                        if (token) {
                            return {
                                Authorization: `Bearer ${token}`,
                            }
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse auth token for headers", e)
                }
                return {}
            },
        }),
    ],
})
