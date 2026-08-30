import { useState, type JSX } from "react"
import { Icon } from "@iconify/react"
import { useNetworkStatus, type UseNetworkStatusOptions } from "../hooks/useNetworkStatus"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

export type InternetIndicatorPosition =
    | "top"
    | "bottom"
    | "top-right"
    | "top-left"
    | "top-center"
    | "bottom-right"
    | "bottom-left"
    | "bottom-center"

export interface InternetIndicatorProps extends UseNetworkStatusOptions {
    /**
     * General placement of the internet indicator (banner and badge).
     * @default "top"
     */
    position?: InternetIndicatorPosition
    /**
     * Optional explicit position for the persistent status badge.
     * Overrides position for the badge if specified.
     * @default "bottom-right" (or derived from position)
     */
    badgePosition?: InternetIndicatorPosition
    /**
     * Whether to show a persistent status badge when online.
     * @default true
     */
    showOnlineBadge?: boolean
    /**
     * Additional CSS classes for the root container.
     */
    className?: string
    /**
     * Allow user to minimize the offline banner to a floating corner badge when offline.
     * @default true
     */
    allowDismiss?: boolean
    /**
     * Show a temporary green banner when connection is restored.
     * @default true
     */
    showReconnectBanner?: boolean
    /**
     * Force offline mode (useful for testing and component previews).
     */
    forceOffline?: boolean
}

const BADGE_POS_CLASSES: Record<InternetIndicatorPosition, string> = {
    "bottom-right": "bottom-5 right-5",
    "bottom-left": "bottom-5 left-5",
    "bottom-center": "bottom-5 left-1/2 -translate-x-1/2",
    bottom: "bottom-5 right-5",
    "top-right": "top-5 right-5",
    "top-left": "top-5 left-5",
    "top-center": "top-5 left-1/2 -translate-x-1/2",
    top: "top-5 right-5",
}

export function InternetIndicator({
    position = "top",
    badgePosition,
    showOnlineBadge = true,
    className,
    allowDismiss = true,
    showReconnectBanner = true,
    notify = true,
    pingUrl,
    pingTimeout,
    forceOffline,
}: InternetIndicatorProps): JSX.Element {
    const networkStatus = useNetworkStatus({ notify, pingUrl, pingTimeout })
    const isOnline = forceOffline !== undefined ? !forceOffline : networkStatus.isOnline
    const wasOffline = networkStatus.wasOffline
    const isChecking = networkStatus.isChecking
    const checkConnection = networkStatus.checkConnection

    const [isDismissed, setIsDismissed] = useState(false)

    // Reset dismissal when network status changes back to online
    if (isOnline && isDismissed) {
        setIsDismissed(false)
    }

    const isBannerBottom = position.startsWith("bottom")
    const bannerPosClass = isBannerBottom
        ? "bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2"
        : "top-4 sm:top-6 left-1/2 -translate-x-1/2"

    const effectiveBadgePosition = badgePosition || position
    const badgePosClass =
        BADGE_POS_CLASSES[effectiveBadgePosition] || BADGE_POS_CLASSES["bottom-right"]

    return (
        <>
            {/* 1. Connection Restored Banner (High-contrast emerald notification) */}
            {isOnline && wasOffline && showReconnectBanner && (
                <div
                    role="status"
                    aria-live="polite"
                    style={{
                        backgroundColor: "#064e3b",
                        color: "#ffffff",
                        borderColor: "#34d399",
                        boxShadow:
                            "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
                    }}
                    className={cn(
                        "fixed z-50 flex items-center gap-3 rounded-2xl border-2 px-5 py-3 text-white shadow-2xl backdrop-blur-xl transition-all duration-300",
                        bannerPosClass,
                        className,
                    )}
                >
                    <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ring-2 ring-emerald-400/60"
                        style={{ backgroundColor: "#047857" }}
                    >
                        <Icon
                            icon="lucide:check"
                            className="h-4 w-4 stroke-[3]"
                            style={{ color: "#ffffff" }}
                        />
                    </div>
                    <div className="flex items-center gap-2 font-sans">
                        <span className="text-sm font-bold text-white">Internet Restored</span>
                        <span className="font-bold text-emerald-300">•</span>
                        <span className="text-xs font-medium text-emerald-100">
                            You are back online.
                        </span>
                    </div>
                </div>
            )}

            {/* 2. Prominent Offline Floating Banner (High-contrast dark card) */}
            {!isOnline && !isDismissed && (
                <aside
                    role="alert"
                    aria-live="assertive"
                    style={{
                        backgroundColor: "#090d16",
                        color: "#ffffff",
                        borderColor: "rgba(244, 63, 94, 0.7)",
                        boxShadow:
                            "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(244, 63, 94, 0.3)",
                    }}
                    className={cn(
                        "fixed z-50 flex w-[calc(100%-2rem)] max-w-xl flex-col gap-3 rounded-2xl border-2 p-4 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 sm:flex-row sm:items-center sm:justify-between",
                        bannerPosClass,
                        className,
                    )}
                >
                    <div className="flex items-center gap-3.5 font-sans">
                        <div
                            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                            style={{
                                backgroundColor: "rgba(244, 63, 94, 0.2)",
                                borderColor: "rgba(244, 63, 94, 0.5)",
                            }}
                        >
                            <Icon
                                icon="lucide:wifi-off"
                                className="h-5 w-5"
                                style={{ color: "#fb7185" }}
                            />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span
                                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                                    style={{ backgroundColor: "#f43f5e" }}
                                />
                                <span
                                    className="relative inline-flex h-3 w-3 rounded-full"
                                    style={{
                                        backgroundColor: "#e11d48",
                                        boxShadow: "0 0 0 2px #090d16",
                                    }}
                                />
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold tracking-tight text-white">
                                    No Internet Connection
                                </span>
                                <span
                                    className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
                                    style={{
                                        backgroundColor: "rgba(244, 63, 94, 0.25)",
                                        color: "#fda4af",
                                        border: "1px solid rgba(244, 63, 94, 0.4)",
                                    }}
                                >
                                    Offline
                                </span>
                            </div>
                            <p className="text-xs font-medium" style={{ color: "#cbd5e1" }}>
                                You are offline. Changes made may not sync with the server.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end font-sans sm:self-auto">
                        <button
                            type="button"
                            onClick={() => checkConnection()}
                            disabled={isChecking}
                            style={{
                                backgroundColor: "#e11d48",
                                color: "#ffffff",
                                boxShadow: "0 4px 12px rgba(225, 29, 72, 0.4)",
                            }}
                            className="flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Icon
                                icon={isChecking ? "lucide:loader-2" : "lucide:refresh-cw"}
                                className={cn("h-3.5 w-3.5", isChecking && "animate-spin")}
                                style={{ color: "#ffffff" }}
                            />
                            <span>{isChecking ? "Checking..." : "Retry"}</span>
                        </button>

                        {allowDismiss && (
                            <button
                                type="button"
                                onClick={() => setIsDismissed(true)}
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl transition-colors hover:bg-slate-800"
                                style={{ color: "#94a3b8" }}
                                aria-label="Minimize offline alert"
                                title="Minimize alert"
                            >
                                <Icon
                                    icon="lucide:x"
                                    className="h-4 w-4"
                                    style={{ color: "#94a3b8" }}
                                />
                            </button>
                        )}
                    </div>
                </aside>
            )}

            {/* 3. Persistent Status Badge (Online state or Minimized Offline state) */}
            {((isOnline && showOnlineBadge) || (!isOnline && isDismissed)) && (
                <button
                    type="button"
                    onClick={() => {
                        if (!isOnline) {
                            setIsDismissed(false)
                        } else {
                            checkConnection()
                        }
                    }}
                    title={
                        isOnline
                            ? isChecking
                                ? "Checking internet connectivity..."
                                : "Internet is connected. Click to test connection."
                            : "Internet is offline. Click to expand alert."
                    }
                    style={
                        isOnline
                            ? isChecking
                                ? {
                                      backgroundColor: "#ffffff",
                                      color: "#134e4a",
                                      border: "2px solid #5eead4",
                                      boxShadow:
                                          "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                                  }
                                : {
                                      backgroundColor: "#ffffff",
                                      color: "#0f172a",
                                      border: "2px solid #86efac",
                                      boxShadow:
                                          "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                                  }
                            : {
                                  backgroundColor: "#e11d48",
                                  color: "#ffffff",
                                  border: "2px solid #fda4af",
                                  boxShadow:
                                      "0 10px 25px -5px rgba(225, 29, 72, 0.4), 0 8px 10px -6px rgba(225, 29, 72, 0.2)",
                              }
                    }
                    className={cn(
                        "fixed z-50 flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2 font-sans text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95",
                        badgePosClass,
                        className,
                    )}
                >
                    <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                        {isOnline ? (
                            <>
                                <span
                                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                                    style={{ backgroundColor: "#34d399" }}
                                />
                                <span
                                    className="relative inline-flex h-2 w-2 rounded-full"
                                    style={{ backgroundColor: "#059669" }}
                                />
                            </>
                        ) : (
                            <>
                                <span
                                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-80"
                                    style={{ backgroundColor: "#ffffff" }}
                                />
                                <span
                                    className="relative inline-flex h-2 w-2 rounded-full"
                                    style={{ backgroundColor: "#ffffff" }}
                                />
                            </>
                        )}
                    </span>

                    <Icon
                        icon={
                            isChecking
                                ? "lucide:loader-2"
                                : isOnline
                                  ? "lucide:wifi"
                                  : "lucide:wifi-off"
                        }
                        className={cn("h-4 w-4", isChecking && "animate-spin")}
                        style={{
                            color: isChecking ? "#0d9488" : isOnline ? "#059669" : "#ffffff",
                        }}
                    />

                    <span style={{ color: isOnline ? "#0f172a" : "#ffffff", fontWeight: 700 }}>
                        {isChecking ? "Checking..." : isOnline ? "Online" : "Offline"}
                    </span>
                </button>
            )}
        </>
    )
}
