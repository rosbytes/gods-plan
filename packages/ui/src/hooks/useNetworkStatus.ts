import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"

export interface UseNetworkStatusOptions {
    /**
     * Whether to show Sonner toast alerts when connection changes.
     * @default true
     */
    notify?: boolean
    /**
     * URL to ping when actively probing internet connection.
     * Defaults to Google's fast 204 endpoint to reliably test real internet connectivity.
     * @default "https://www.gstatic.com/generate_204"
     */
    pingUrl?: string
    /**
     * Timeout in ms for connection probe.
     * @default 3000
     */
    pingTimeout?: number
    /**
     * Polling interval in ms to actively check connection status.
     * Set to 0 to disable periodic polling.
     * @default 6000
     */
    pollInterval?: number
}

export interface NetworkStatus {
    isOnline: boolean
    wasOffline: boolean
    isChecking: boolean
    checkConnection: () => Promise<boolean>
}

export function useNetworkStatus(options: UseNetworkStatusOptions = {}): NetworkStatus {
    const {
        notify = true,
        pingUrl = "https://www.gstatic.com/generate_204",
        pingTimeout = 3000,
        pollInterval = 6000,
    } = options

    const [isOnline, setIsOnline] = useState<boolean>(() => {
        if (typeof window === "undefined") return true
        return typeof navigator !== "undefined" ? navigator.onLine : true
    })

    const [wasOffline, setWasOffline] = useState(false)
    const [isChecking, setIsChecking] = useState(false)
    const wasOfflineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const previousOnlineRef = useRef<boolean>(isOnline)

    const updateOnlineState = useCallback(
        (newOnlineStatus: boolean) => {
            const wasPreviouslyOnline = previousOnlineRef.current

            if (newOnlineStatus && !wasPreviouslyOnline) {
                // Transitioned from Offline -> Online
                setIsOnline(true)
                previousOnlineRef.current = true
                setWasOffline(true)

                if (notify) {
                    toast.success("Back online", {
                        id: "network-status",
                        description: "Your internet connection has been restored.",
                        duration: 3500,
                    })
                }

                if (wasOfflineTimerRef.current) {
                    clearTimeout(wasOfflineTimerRef.current)
                }
                wasOfflineTimerRef.current = setTimeout(() => {
                    setWasOffline(false)
                }, 4000)
            } else if (!newOnlineStatus && wasPreviouslyOnline) {
                // Transitioned from Online -> Offline
                setIsOnline(false)
                previousOnlineRef.current = false
                setWasOffline(false)

                if (notify) {
                    toast.warning("You are currently offline", {
                        id: "network-status",
                        description:
                            "Check your internet connection. Some features may be unavailable.",
                        duration: 5000,
                    })
                }
            } else if (!newOnlineStatus) {
                setIsOnline(false)
                previousOnlineRef.current = false
            } else {
                setIsOnline(true)
                previousOnlineRef.current = true
            }
        },
        [notify],
    )

    const checkConnection = useCallback(async (): Promise<boolean> => {
        setIsChecking(true)
        let reachable = false

        if (typeof navigator !== "undefined" && !navigator.onLine) {
            reachable = false
        } else if (typeof window !== "undefined" && typeof fetch === "function") {
            try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), pingTimeout)

                await fetch(`${pingUrl}?_t=${Date.now()}`, {
                    method: "HEAD",
                    cache: "no-store",
                    mode: "no-cors",
                    signal: controller.signal,
                })
                clearTimeout(timeoutId)
                reachable = true
            } catch {
                // Fetch failed or timed out -> definitely offline/unreachable
                reachable = false
            }
        } else {
            reachable = typeof navigator !== "undefined" ? navigator.onLine : true
        }

        setIsChecking(false)
        updateOnlineState(reachable)
        return reachable
    }, [pingUrl, pingTimeout, updateOnlineState])

    useEffect(() => {
        if (typeof window === "undefined") return

        const handleOnlineEvent = () => {
            updateOnlineState(true)
            checkConnection()
        }

        const handleOfflineEvent = () => {
            updateOnlineState(false)
        }

        const handleFocus = () => {
            checkConnection()
        }

        window.addEventListener("online", handleOnlineEvent)
        window.addEventListener("offline", handleOfflineEvent)
        window.addEventListener("focus", handleFocus)

        // Periodic active polling to detect Wi-Fi or router disconnects immediately
        let intervalId: ReturnType<typeof setInterval> | null = null
        if (pollInterval > 0) {
            intervalId = setInterval(() => {
                checkConnection()
            }, pollInterval)
        }

        return () => {
            window.removeEventListener("online", handleOnlineEvent)
            window.removeEventListener("offline", handleOfflineEvent)
            window.removeEventListener("focus", handleFocus)
            if (intervalId) {
                clearInterval(intervalId)
            }
            if (wasOfflineTimerRef.current) {
                clearTimeout(wasOfflineTimerRef.current)
            }
        }
    }, [checkConnection, pollInterval, updateOnlineState])

    return {
        isOnline,
        wasOffline,
        isChecking,
        checkConnection,
    }
}
