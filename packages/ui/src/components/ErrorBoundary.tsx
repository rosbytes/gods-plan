import React, { Component, type ErrorInfo, type ReactNode } from "react"

export interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught application error:", error, errorInfo)
        this.props.onError?.(error, errorInfo)
    }

    handleReload = () => {
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            const isDev =
                typeof globalThis !== "undefined" &&
                (globalThis as any).process?.env?.NODE_ENV === "development"

            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
                    <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <svg
                                className="h-8 w-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h2 className="mb-2 text-xl font-bold text-gray-900">
                            Something went wrong
                        </h2>
                        <p className="mb-6 text-sm text-gray-600">
                            An unexpected error occurred. Please refresh the page to continue.
                        </p>
                        {isDev && this.state.error && (
                            <pre className="mb-6 max-h-40 overflow-auto rounded-lg bg-gray-100 p-3 text-left text-xs text-red-800">
                                {this.state.error.toString()}
                            </pre>
                        )}
                        <button
                            type="button"
                            onClick={this.handleReload}
                            className="inline-flex w-full items-center justify-center rounded-xl bg-[#0B4E3E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#093d31] focus:ring-2 focus:ring-[#0B4E3E] focus:ring-offset-2 focus:outline-none"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
