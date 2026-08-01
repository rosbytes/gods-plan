import { useNavigate } from "react-router-dom"
import { MenuIcon, PlusIcon } from "../common/Icons"
import { Button } from "../ui"

export interface TopBarProps {
    onOpenMobile: () => void
    title?: string
    subtitle?: string
}

export function TopBar({ onOpenMobile, title = "Dashboard", subtitle }: TopBarProps) {
    const navigate = useNavigate()

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
                <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-[#135B47] sm:flex">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    <span>System Active</span>
                </div>

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
