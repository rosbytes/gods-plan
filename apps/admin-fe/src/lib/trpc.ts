import { createTRPCReact } from "@trpc/react-query"
import type { AppRouter } from "../../../admin-be/src/trpc/appRouter"
import { httpBatchLink } from "@trpc/client"

export const trpc = createTRPCReact<AppRouter>()

// Create the client
export const trpcClient = trpc.createClient({
    links: [
        httpBatchLink({
            url: `${import.meta.env.VITE_API_URL}/trpc`, // backend tRPC endpoint
        }),
    ],
})
