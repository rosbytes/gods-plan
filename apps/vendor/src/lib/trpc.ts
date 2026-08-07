import { createTRPCReact } from "@trpc/react-query"
import type { AppRouter } from "../../../vendor-api/src/trpc"
import { httpBatchLink } from "@trpc/client"
import { customFetch } from "./customFetch"

export const trpc = createTRPCReact<AppRouter>()

// Create the client
export const trpcClient = trpc.createClient({
    links: [
        httpBatchLink({
            url: `${import.meta.env.VITE_API_URL}/trpc`, // backend tRPC endpoint
            // include cookies
            fetch: customFetch,
        }),
    ],
})
