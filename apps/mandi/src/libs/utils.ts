import type { VendorStatus, PaymentMethodLabel } from "@/types"

/** Get display label and text color class for a vendor status */
export function getStatusStyle(status: VendorStatus): { label: string; cls: string } {
    switch (status) {
        case "cancelled":
            return { label: "Cancelled", cls: "text-[#E21931]" }
        case "running-late":
            return { label: "Running Late", cls: "text-[#F97316]" }
        case "order-picked":
            return { label: "Order Picked", cls: "text-[#0A5445]" }
        case "active":
            return { label: "Active", cls: "text-[#0A5445]" }
    }
}

/** Get name initials (2 chars max) */
export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
}

/** Get text color class for finance payment method */
export function getPaymentMethodColor(method: PaymentMethodLabel): string {
    switch (method) {
        case "Online":
        case "Cash":
            return "text-[#0A5445]"
        case "Failed":
            return "text-[#E21931]"
        case "In Process":
            return "text-[#FE5D27]"
        default:
            return "text-[#444444]"
    }
}

/** Format a date for transaction display */
export function formatTransactionDate(): string {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    })
    const parts = formatter.formatToParts(now)
    const day = parts.find((p) => p.type === "day")?.value
    const month = parts.find((p) => p.type === "month")?.value
    const year = parts.find((p) => p.type === "year")?.value
    const time = formatter.format(now).split(", ")[1]
    return `${day} ${month}, ${year} | ${time}`
}
