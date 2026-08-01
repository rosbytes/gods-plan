import React, { useEffect } from "react"
import { CrossIcon } from "../common/Icons"

export interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    subtitle?: string
    children: React.ReactNode
    maxWidth?: "sm" | "md" | "lg" | "xl"
}

export function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = "md" }: ModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose()
            }
        }
        if (isOpen) {
            document.body.style.overflow = "hidden"
            window.addEventListener("keydown", handleKeyDown)
        }
        return () => {
            document.body.style.overflow = "unset"
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const maxWidthStyles = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div
                className="animate-in fade-in fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative z-10 w-full ${maxWidthStyles[maxWidth]} animate-in slide-in-from-bottom-5 max-h-[90vh] transform overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl transition-all duration-200 sm:rounded-2xl`}
            >
                {/* Modal Header */}
                <div className="mb-4 flex items-start justify-between border-b border-gray-100 pb-3">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                        {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Close modal"
                    >
                        <CrossIcon size={18} />
                    </button>
                </div>

                {/* Body */}
                <div>{children}</div>
            </div>
        </div>
    )
}
