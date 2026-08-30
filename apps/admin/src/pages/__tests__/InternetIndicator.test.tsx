import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import React, { act } from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { InternetIndicator } from "@ros/ui"
import { TopBar } from "../../components/layout/TopBar"

describe("Admin SPA - Global Internet Indicator & Network Status", () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("renders persistent online status badge globally by default", () => {
        render(
            <MemoryRouter>
                <InternetIndicator notify={false} />
            </MemoryRouter>,
        )
        const badge = screen.getByRole("button", { name: /Online/i })
        expect(badge).toBeDefined()
    })

    it("displays offline warning banner globally when window enters offline state", () => {
        render(
            <MemoryRouter>
                <InternetIndicator notify={false} />
            </MemoryRouter>,
        )

        act(() => {
            window.dispatchEvent(new Event("offline"))
        })

        expect(screen.getByRole("alert")).toBeDefined()
        expect(screen.getByText("No Internet Connection")).toBeDefined()
        expect(
            screen.getByText("You are offline. Changes made may not sync with the server."),
        ).toBeDefined()
    })

    it("allows user to retry connection when offline", async () => {
        render(
            <MemoryRouter>
                <InternetIndicator forceOffline notify={false} />
            </MemoryRouter>,
        )

        const retryBtn = screen.getByRole("button", { name: /Retry/i })
        expect(retryBtn).toBeDefined()
        await act(async () => {
            fireEvent.click(retryBtn)
        })
    })

    it("updates TopBar status pill based on live network status", () => {
        const { unmount } = render(
            <MemoryRouter>
                <TopBar onOpenMobile={() => {}} title="Test Dashboard" />
            </MemoryRouter>,
        )

        // Initially online
        expect(screen.getByText("System Online")).toBeDefined()

        // Go offline
        act(() => {
            window.dispatchEvent(new Event("offline"))
        })

        expect(screen.getByText("Offline")).toBeDefined()

        // Back online
        act(() => {
            window.dispatchEvent(new Event("online"))
        })

        expect(screen.getByText("System Online")).toBeDefined()

        unmount()
    })
})
