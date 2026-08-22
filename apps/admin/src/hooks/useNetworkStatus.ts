import { useState, useEffect } from "react"
import { toast } from "sonner"

export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState<boolean>(() => {
        if (typeof window === "undefined") return true
        return navigator.onLine
    })

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            toast.success("Back online", {
                id: "network-status",
                description: "Your internet connection has been restored.",
                duration: 3000,
            })
        }

        const handleOffline = () => {
            setIsOnline(false)
            toast.warning("You are currently offline", {
                id: "network-status",
                description: "Using offline cached data. Some features may be unavailable.",
                duration: 6000,
            })
        }

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [])

    return { isOnline }
}
