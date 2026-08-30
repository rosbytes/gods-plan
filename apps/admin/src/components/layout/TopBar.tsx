import { useNavigate } from "react-router-dom"
import { MenuIcon, PlusIcon, DownloadIcon } from "../common/Icons"
import { Button } from "../ui"
import { usePwaInstall } from "../../hooks/usePwaInstall"
import { useNetworkStatus } from "../../hooks/useNetworkStatus"

export interface TopBarProps {
    onOpenMobile: () => void
    title?: string
    subtitle?: string
}

export function TopBar({ onOpenMobile, title = "Dashboard", subtitle }: TopBarProps) {
    const navigate = useNavigate()
    const { canInstall, install } = usePwaInstall()
    const { isOnline, isChecking, checkConnection } = useNetworkStatus({ notify: false })

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6">
            {/* Left Section: Mobile Menu + Breadcrumbs/Title */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onOpenMobile}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 lg:hidden"
                    aria-label="Open navigation menu"
                >
                    <MenuIcon size={20} />
                </button>

                <div>
                    <h1 className="text-base font-bold tracking-tight text-gray-800 sm:text-lg">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="hidden text-xs font-medium text-gray-400 sm:block">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Right Section: System Status & Action Button */}
            <div className="flex items-center gap-3">
                {canInstall && (
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={<DownloadIcon size={16} />}
                        onClick={install}
                        className="animate-fade-in"
                    >
                        Install App
                    </Button>
                )}

                {isOnline ? (
                    <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-[#135B47] sm:flex">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                        <span>System Online</span>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => checkConnection()}
                        title="Internet connection is offline. Click to test connection."
                        className="hidden cursor-pointer items-center gap-2 rounded-full border border-red-200 bg-red-50/90 px-3 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 sm:flex"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                        </span>
                        <span>{isChecking ? "Checking..." : "Offline"}</span>
                    </button>
                )}

                <Button
                    variant="primary"
                    size="sm"
                    icon={<PlusIcon size={16} />}
                    onClick={() => navigate("/create-vendor")}
                    className="hidden sm:inline-flex"
                >
                    New Vendor
                </Button>
            </div>
        </header>
    )
}
