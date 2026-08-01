import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { trpc } from "../../lib/trpc"
import { SpinnerIcon } from "../common/Icons"

export interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const location = useLocation()

    // Query admin profile details (/auth/me) as logged-in indicator
    const {
        data: user,
        isLoading,
        isError,
    } = trpc.auth.me.useQuery(undefined, {
        retry: false,
        staleTime: 5 * 60 * 1000,
    })

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-3">
                    <SpinnerIcon size={32} className="text-[#135B47]" />
                    <span className="text-xs font-semibold text-gray-500">
                        Verifying admin authentication...
                    </span>
                </div>
            </div>
        )
    }

    if (isError || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <>{children}</>
}
