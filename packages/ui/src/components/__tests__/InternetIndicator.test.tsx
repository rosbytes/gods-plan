import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import React, { act } from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { InternetIndicator } from "../InternetIndicator"

describe("@ros/ui - InternetIndicator Component", () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("renders persistent online badge by default when online", () => {
        render(<InternetIndicator notify={false} />)
        const onlineBadge = screen.getByRole("button", { name: /Online/i })
        expect(onlineBadge).toBeDefined()
    })

    it("hides online badge when showOnlineBadge is false", () => {
        const { container } = render(<InternetIndicator notify={false} showOnlineBadge={false} />)
        expect(container.firstChild).toBeNull()
    })

    it("renders offline banner when forceOffline is true", () => {
        render(<InternetIndicator forceOffline notify={false} />)
        expect(screen.getByRole("alert")).toBeDefined()
        expect(screen.getByText("No Internet Connection")).toBeDefined()
        expect(screen.getByText("Retry")).toBeDefined()
    })

    it("allows minimizing offline banner to corner badge and re-expanding", () => {
        render(<InternetIndicator forceOffline notify={false} allowDismiss={true} />)

        const minimizeBtn = screen.getByLabelText("Minimize offline alert")
        fireEvent.click(minimizeBtn)

        // Banner should now be minimized
        expect(screen.queryByRole("alert")).toBeNull()
        const offlineBadge = screen.getByTitle("Internet is offline. Click to expand alert.")
        expect(offlineBadge).toBeDefined()
        expect(screen.getByText("Offline")).toBeDefined()

        // Clicking the badge expands it back
        fireEvent.click(offlineBadge)
        expect(screen.getByRole("alert")).toBeDefined()
    })

    it("renders reconnection banner when returning online after being offline", async () => {
        render(<InternetIndicator notify={false} showReconnectBanner={true} />)

        // Trigger offline event
        act(() => {
            window.dispatchEvent(new Event("offline"))
        })

        expect(screen.getByRole("alert")).toBeDefined()
        expect(screen.getByText("No Internet Connection")).toBeDefined()

        // Trigger online event
        act(() => {
            window.dispatchEvent(new Event("online"))
        })

        // Should now show reconnection status
        expect(screen.getByRole("status")).toBeDefined()
        expect(screen.getByText("Internet Restored")).toBeDefined()
        expect(screen.getByText("You are back online.")).toBeDefined()

        // After 4 seconds, the restored banner should auto dismiss
        act(() => {
            vi.advanceTimersByTime(4500)
        })

        expect(screen.queryByRole("status")).toBeNull()
    })
})
