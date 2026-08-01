import React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
}

export function Input({ label, error, helperText, className = "", id, ...props }: InputProps) {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-gray-500">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] font-semibold text-gray-800 transition-colors placeholder:text-gray-400 focus:border-[#135B47] focus:outline-none ${
                    error ? "border-red-500 focus:border-red-500" : ""
                } ${className}`}
                {...props}
            />
            {error ? (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            ) : helperText ? (
                <p className="mt-1 text-xs text-gray-400">{helperText}</p>
            ) : null}
        </div>
    )
}
