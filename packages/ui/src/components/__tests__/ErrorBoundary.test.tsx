import { describe, it, expect, vi } from "vitest"
import React from "react"
import { render, screen } from "@testing-library/react"
import { ErrorBoundary } from "../ErrorBoundary"

function ProblemChild({ shouldThrow }: { shouldThrow: boolean }) {
    if (shouldThrow) {
        throw new Error("CRASH_TEST_DUMMY")
    }
    return <div>Healthy Child Component</div>
}

describe("@ros/ui - ErrorBoundary Component", () => {
    it("renders children successfully when no error is thrown", () => {
        render(
            <ErrorBoundary>
                <ProblemChild shouldThrow={false} />
            </ErrorBoundary>,
        )

        expect(screen.getByText("Healthy Child Component")).toBeDefined()
    })

    it("catches render errors and displays standard fallback UI without crashing app", () => {
        // Prevent console.error noise in test runner
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

        render(
            <ErrorBoundary>
                <ProblemChild shouldThrow={true} />
            </ErrorBoundary>,
        )

        expect(screen.getByText("Something went wrong")).toBeDefined()
        expect(screen.getByText("Reload Application")).toBeDefined()

        consoleErrorSpy.mockRestore()
    })

    it("renders custom fallback component when provided", () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

        render(
            <ErrorBoundary fallback={<div>Custom Crash Handler</div>}>
                <ProblemChild shouldThrow={true} />
            </ErrorBoundary>,
        )

        expect(screen.getByText("Custom Crash Handler")).toBeDefined()

        consoleErrorSpy.mockRestore()
    })
})
