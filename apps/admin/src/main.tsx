import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { trpc, trpcClient } from "./lib/trpc"
import { Toaster } from "sonner"
import { PwaManager } from "./components/common/PwaManager"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                <Toaster richColors position="top-right" />
                <PwaManager />
                <App />
            </QueryClientProvider>
        </trpc.Provider>
    </StrictMode>,
)
