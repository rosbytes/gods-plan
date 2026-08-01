import React from "react"
import { useNavigate } from "react-router-dom"
import { BackIcon } from "../common/Icons"

export interface PageHeaderProps {
    title: string
    subtitle?: string
    backTo?: string
    onBack?: () => void
    actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, backTo, onBack, actions }: PageHeaderProps) {
    const navigate = useNavigate()

    const handleBackClick = () => {
        if (onBack) {
            onBack()
        } else if (backTo) {
            navigate(backTo)
        } else {
            navigate(-1)
        }
    }

    return (
        <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBackClick}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 active:scale-95"
                        aria-label="Go back"
                    >
                        <BackIcon size={18} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-gray-800 sm:text-xl">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-xs font-medium text-gray-400">{subtitle}</p>
                        )}
                    </div>
                </div>

                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        </header>
    )
}
