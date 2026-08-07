import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { trpc, trpcClient } from "./lib/trpc"
import { Toaster } from "sonner"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
        },
    },
})

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                <Toaster richColors position="top-right" />

                <App />
            </QueryClientProvider>
        </trpc.Provider>
    </StrictMode>,
)
