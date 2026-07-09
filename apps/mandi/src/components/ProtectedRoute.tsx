import { Navigate } from "react-router-dom"
import { useStore } from "@/store"
import type { ReactNode } from "react"

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const isAuthenticated = useStore((state) => state.isAuthenticated)

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}
