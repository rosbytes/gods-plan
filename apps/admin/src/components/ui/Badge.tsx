import React from "react"

export interface BadgeProps {
    children: React.ReactNode
    variant?: "success" | "warning" | "info" | "neutral" | "danger"
    className?: string
}

export function Badge({ children, variant = "info", className = "" }: BadgeProps) {
    const variantStyles = {
        success: "bg-[#E8F3F0] text-[#135B47]",
        warning: "bg-[#FFF3E0] text-[#E65100]",
        info: "bg-blue-50 text-blue-700",
        neutral: "bg-gray-100 text-gray-700",
        danger: "bg-red-50 text-red-700",
    }

    return (
        <span
            className={`inline-flex shrink-0 items-center rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${variantStyles[variant]} ${className}`}
        >
            {children}
        </span>
    )
}
