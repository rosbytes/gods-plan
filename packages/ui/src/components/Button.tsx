import React from "react"
import { Spinner } from "./Spinner"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean
    variant?: "primary" | "secondary" | "outline" | "danger"
}

export function Button({
    children,
    isLoading = false,
    disabled,
    variant = "primary",
    className = "",
    ...props
}: ButtonProps) {
    const baseStyles =
        "inline-flex items-center justify-center font-semibold transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"

    const variantStyles = {
        primary: "bg-[#0B4E3E] text-white hover:bg-[#093d31] active:bg-[#073027]",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300",
        outline:
            "border border-[#0B4E3E] text-[#0B4E3E] bg-transparent hover:bg-[#0B4E3E]/5 active:bg-[#0B4E3E]/10",
        danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
    }

    return (
        <button
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            {...props}
        >
            {isLoading ? (
                <span className="inline-flex items-center gap-2">
                    <Spinner size={18} />
                    {children}
                </span>
            ) : (
                children
            )}
        </button>
    )
}
