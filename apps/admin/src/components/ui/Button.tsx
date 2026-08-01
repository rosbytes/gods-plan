import React from "react"
import { SpinnerIcon } from "../common/Icons"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "danger" | "ghost"
    size?: "sm" | "md" | "lg"
    isLoading?: boolean
    icon?: React.ReactNode
    fullWidth?: boolean
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    icon,
    fullWidth = false,
    disabled,
    className = "",
    ...props
}: ButtonProps) {
    const baseStyle =
        "inline-flex items-center justify-center font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"

    const variantStyles = {
        primary: "bg-[#135B47] text-white hover:bg-[#0f4d3c] shadow-sm",
        secondary: "bg-emerald-50 text-[#135B47] hover:bg-emerald-100",
        outline: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
        danger: "bg-red-600 text-white hover:bg-red-700",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    }

    const sizeStyles = {
        sm: "px-3 py-1.5 text-xs gap-1.5",
        md: "px-4 py-2.5 text-sm gap-2",
        lg: "px-5 py-3.5 text-base gap-2.5 rounded-[18px]",
    }

    const widthStyle = fullWidth ? "w-full" : ""

    return (
        <button
            disabled={disabled || isLoading}
            className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
            {...props}
        >
            {isLoading ? (
                <SpinnerIcon size={size === "sm" ? 14 : size === "lg" ? 22 : 18} />
            ) : icon ? (
                <span>{icon}</span>
            ) : null}
            <span>{children}</span>
        </button>
    )
}
