import { useLocation, useNavigate } from "react-router-dom"
import { trpc } from "../../lib/trpc"
import {
    DashboardIcon,
    BuildingIcon,
    StoreIcon,
    VegIcon,
    UserPlusIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    LogOutIcon,
} from "../common/Icons"

export interface SidebarProps {
    isCollapsed: boolean
    onToggleCollapse: () => void
    mobileOpen?: boolean
    onCloseMobile?: () => void
}

export function Sidebar({
    isCollapsed,
    onToggleCollapse,
    mobileOpen = false,
    onCloseMobile,
}: SidebarProps) {
    const location = useLocation()
    const navigate = useNavigate()

    const { data: adminUser } = trpc.auth.me.useQuery(undefined, {
        staleTime: 5 * 60 * 1000,
    })

    const logoutMutation = trpc.auth.logout.useMutation({
        onSuccess: () => {
            navigate("/login", { replace: true })
        },
    })

    const handleSignOut = () => {
        logoutMutation.mutate()
    }

    const navItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: DashboardIcon,
            badge: null,
        },
        {
            name: "Cities",
            path: "/manage/cities",
            icon: BuildingIcon,
            badge: null,
        },
        {
            name: "Mandis",
            path: "/manage/mandis",
            icon: StoreIcon,
            badge: null,
        },
        {
            name: "Vegetables",
            path: "/manage/vegetables",
            icon: VegIcon,
            badge: null,
        },
        {
            name: "New Vendor",
            path: "/create-vendor",
            icon: UserPlusIcon,
            badge: "Action",
        },
    ]

    const handleNavigate = (path: string) => {
        navigate(path)
        if (onCloseMobile) onCloseMobile()
    }

    const adminInitials = adminUser?.fullName
        ? adminUser.fullName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
        : "AD"

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
                    onClick={onCloseMobile}
                />
            )}

            {/* Sidebar Drawer */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0F382C] text-white shadow-xl transition-all duration-300 ${
                    isCollapsed ? "w-20" : "w-64"
                } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                {/* Brand Header */}
                <div className="flex h-16 items-center justify-between border-b border-emerald-950/60 px-4">
                    <div
                        onClick={() => handleNavigate("/dashboard")}
                        className="flex cursor-pointer items-center gap-3 overflow-hidden"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 text-lg font-bold text-white shadow-md">
                            R
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="text-base font-extrabold tracking-tight text-white">
                                    ROS Admin
                                </span>
                                <span className="text-[10px] font-semibold tracking-widest text-emerald-400 uppercase">
                                    Workspace
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Collapse Toggle Button (Desktop) */}
                    <button
                        onClick={onToggleCollapse}
                        className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-emerald-300 transition-colors hover:bg-emerald-900/60 hover:text-white lg:flex"
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? (
                            <ChevronRightIcon size={18} />
                        ) : (
                            <ChevronLeftIcon size={18} />
                        )}
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 scrollbar-none space-y-1 overflow-y-auto p-3">
                    <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-emerald-400/70 uppercase">
                        {!isCollapsed && "Menu"}
                    </div>
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path

                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavigate(item.path)}
                                className={`group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
                                    isActive
                                        ? "bg-[#135B47] text-white shadow-sm"
                                        : "text-emerald-100/70 hover:bg-emerald-900/50 hover:text-white"
                                }`}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <Icon
                                    size={20}
                                    className={`shrink-0 transition-transform group-hover:scale-110 ${
                                        isActive ? "text-emerald-300" : "text-emerald-400/80"
                                    }`}
                                />
                                {!isCollapsed && (
                                    <span className="flex-1 truncate text-left">{item.name}</span>
                                )}
                                {!isCollapsed && item.badge && (
                                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </nav>

                {/* Admin Profile Footer */}
                <div className="border-t border-emerald-950/60 p-3">
                    <div className="flex items-center gap-3 rounded-xl bg-emerald-950/40 p-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white shadow-xs">
                            {adminInitials}
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-1 flex-col overflow-hidden">
                                <span className="truncate text-xs font-bold text-white">
                                    {adminUser?.fullName || "Admin Profile"}
                                </span>
                                <span className="truncate text-[11px] text-emerald-300/70">
                                    {adminUser?.phone || adminUser?.email || "Authenticated"}
                                </span>
                            </div>
                        )}
                        {!isCollapsed && (
                            <button
                                onClick={handleSignOut}
                                className="cursor-pointer p-1 text-emerald-400 transition-colors hover:text-white"
                                title="Sign out"
                            >
                                <LogOutIcon size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    )
}
