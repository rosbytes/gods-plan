import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "status"
    isLoading?: boolean
    children: React.ReactNode
}

export default function Button({
    variant = "primary",
    isLoading = false,
    className = "",
    disabled,
    children,
    ...props
}: ButtonProps) {
    const baseStyles =
        "font-apercu w-full flex items-center justify-center rounded-xl text-[18px] font-bold transition-all duration-150 border-none outline-none"

    let variantStyles = ""
    if (variant === "primary") {
        variantStyles =
            disabled || isLoading
                ? "bg-[#D9E5E2] text-[#4A7A6E] pointer-events-none"
                : "bg-[#0B4E3E] text-white hover:bg-[#093F32] cursor-pointer active:scale-[0.985] shadow-sm"
    } else if (variant === "status") {
        variantStyles = "bg-[#DAE6E3] text-[#0A5445] pointer-events-none"
    } else if (variant === "secondary") {
        variantStyles = "bg-[#F2F3F6] text-[#444444] hover:bg-[#EAEBED] cursor-pointer"
    }

    return (
        <button
            className={`${baseStyles} ${variantStyles} ${className}`}
            disabled={disabled || isLoading}
            style={{ height: 48, ...props.style }}
            {...props}
        >
            {isLoading ? "Loading..." : children}
        </button>
    )
}
