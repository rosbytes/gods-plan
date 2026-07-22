import React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string
}

export default function Input({ error, className = "", placeholder, ...props }: InputProps) {
    const errorStyles = error
        ? "border-[#C8383A] placeholder-[#C8383A] text-[#C8383A]"
        : "border-transparent focus:border-[#0B4E3E]"

    return (
        <div className="relative w-full">
            <input
                className={`font-apercu h-[52px] w-full rounded-xl border-[1.5px] bg-white px-4 text-[18px] text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150 outline-none ${errorStyles} ${className}`}
                placeholder={error || placeholder}
                {...props}
            />
        </div>
    )
}
