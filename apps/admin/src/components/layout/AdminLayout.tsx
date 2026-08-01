import React, { useState } from "react"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"

export interface AdminLayoutProps {
    children: React.ReactNode
    title?: string
    subtitle?: string
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-gray-900">
            {/* Sidebar */}
            <Sidebar
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
            />

            {/* Main Content Area */}
            <div
                className={`flex flex-1 flex-col transition-all duration-300 ${
                    isCollapsed ? "lg:ml-20" : "lg:ml-64"
                }`}
            >
                <TopBar
                    onOpenMobile={() => setMobileOpen(true)}
                    title={title}
                    subtitle={subtitle}
                />

                <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
