import type { ReactNode } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import BottomNavbar, { HomeIcon, OrdersIcon, FinanceIcon } from "@/components/BottomNavbar"
import { useStore } from "@/store"
import { trpc } from "@/libs/trpc"
import ROSLogo from "../../assets/logos/ros-black.svg"

interface AppLayoutProps {
    children: ReactNode
    /** Show the bottom navigation bar on mobile (default: true) */
    showNav?: boolean
    /** Additional CSS classes on the main container */
    className?: string
}

function UserIcon({ active }: { active: boolean }) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                stroke={active ? "white" : "#A3E2D4"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M19.125 21C19.125 17.6875 15.9375 15 12 15C8.0625 15 4.875 17.6875 4.875 21"
                stroke={active ? "white" : "#A3E2D4"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function LogOutIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                stroke="#A3E2D4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M16 17L21 12L16 7"
                stroke="#A3E2D4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M21 12H9"
                stroke="#A3E2D4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export default function AppLayout({ children, showNav = true, className = "" }: AppLayoutProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const pathname = location.pathname
    const logout = useStore((state) => state.logout)

    // Fetch profile info using the token (which is passed in headers)
    const { data: profile } = trpc.vendor.getProfile.useQuery(undefined, {
        retry: false,
        refetchOnWindowFocus: false,
    })

    const handleLogoutClick = () => {
        logout()
        navigate("/login", { replace: true })
    }

    const navItems = [
        { label: "Home", path: "/", Icon: HomeIcon },
        { label: "Orders", path: "/orders", Icon: OrdersIcon },
        { label: "Finance", path: "/finance", Icon: FinanceIcon },
        { label: "Profile", path: "/profile", Icon: UserIcon },
    ]

    return (
        <div className="min-h-screen bg-[#F4F5F8] md:flex">
            {/* Desktop Left Sidebar (md and up) */}
            <aside className="fixed top-0 left-0 z-40 hidden h-screen w-72 flex-col justify-between border-r border-white/10 bg-[#0B4E3E] p-6 text-white md:flex">
                <div className="flex flex-col gap-8">
                    {/* Header Brand */}
                    <div className="flex items-center gap-3">
                        <img src={ROSLogo} className="" />

                        <div className="flex flex-col">
                            <span className="font-apercu text-xl font-bold tracking-tight">
                                ROS Mandi
                            </span>
                            <span className="font-apercu text-xs font-medium text-teal-200/80">
                                Vendor Portal
                            </span>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex flex-col gap-2">
                        {navItems.map(({ label, path, Icon }) => {
                            const isActive =
                                label === "Home"
                                    ? pathname === "/"
                                    : pathname === path || pathname.startsWith(path)

                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`font-apercu flex items-center gap-4 rounded-xl px-4 py-3 text-[16px] font-bold transition-all duration-150 ${
                                        isActive
                                            ? "bg-white/10 text-white shadow-sm"
                                            : "text-teal-100/70 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    <Icon active={isActive} />
                                    <span>{label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom User Area */}
                <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
                    {profile && (
                        <div className="flex items-center gap-3">
                            <img
                                src={profile.avatarUrl}
                                alt={profile.fullName}
                                className="h-11 w-11 rounded-full border border-white/20 object-cover shadow-sm"
                            />
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-apercu truncate text-sm leading-tight font-semibold">
                                    {profile.fullName}
                                </span>
                                <span className="font-apercu truncate text-xs text-teal-200/70">
                                    {profile.primaryPhone}
                                </span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleLogoutClick}
                        className="font-apercu flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-[14px] font-semibold text-[#A3E2D4] transition-all duration-150 hover:border-white/40 hover:bg-white/5 hover:text-white"
                    >
                        <LogOutIcon />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Desktop Shift Wrapper (md and up shift right to avoid sidebar overlap) */}
            <div className="flex min-h-screen flex-1 flex-col md:ml-72">
                {/* Mobile View Container */}
                <div className="md:hidden">
                    <div
                        className={`relative mx-auto min-h-screen max-w-107.5 bg-[#F2F3F6] ${showNav ? "pb-20" : "pb-10"} ${className}`}
                    >
                        {/* Status bar spacer */}
                        <div className="h-8" />
                        {children}
                        {showNav && <BottomNavbar />}
                    </div>
                </div>

                {/* Desktop View Container (Full width responsive layout) */}
                <div className="mx-auto hidden w-full max-w-6xl grow px-8 py-8 md:block">
                    <main className={className}>{children}</main>
                </div>
            </div>
        </div>
    )
}
