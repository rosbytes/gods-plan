import React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export function Input({ label, error, className = "", id, ...props }: InputProps) {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)

    return (
        <div className="flex w-full flex-col gap-1.5">
            {label && (
                <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none ${
                    error
                        ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                        : "border-gray-200 focus:border-[#0B4E3E] focus:ring-1 focus:ring-[#0B4E3E]"
                } ${className}`}
                {...props}
            />
            {error && <span className="text-xs font-medium text-red-500">{error}</span>}
        </div>
    )
}
