import React from "react"

export interface EmptyStateProps {
    title: string
    description?: string
    icon?: React.ReactNode
    action?: React.ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-xs">
            {icon && <div className="mb-3 text-gray-400">{icon}</div>}
            <h3 className="text-base font-bold text-gray-700">{title}</h3>
            {description && (
                <p className="mt-1 max-w-sm text-xs font-medium text-gray-400">{description}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    )
}
