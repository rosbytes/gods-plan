import type { ReactNode } from "react"
import BottomNavbar from "@/components/BottomNavbar"

interface AppLayoutProps {
    children: ReactNode
    /** Show the bottom navigation bar (default: true) */
    showNav?: boolean
    /** Additional CSS classes on the main container */
    className?: string
}

/**
 * Standard mobile-app layout wrapper.
 * Provides consistent max-width, bg color, status-bar spacer, and bottom nav.
 */
export default function AppLayout({ children, showNav = true, className = "" }: AppLayoutProps) {
    return (
        <div
            className={`relative mx-auto min-h-screen max-w-[430px] bg-[#F2F3F6] ${showNav ? "pb-20" : "pb-10"} ${className}`}
        >
            {/* Status bar spacer */}
            <div className="h-10" />
            {children}
            {showNav && <BottomNavbar />}
        </div>
    )
}
