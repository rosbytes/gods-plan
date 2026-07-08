// ─── Vendor ──────────────────────────────────────────────────────────
export type VendorStatus = "order-picked" | "cancelled" | "running-late" | "active"
export type PayMethod = "cash" | "online"

export interface Vendor {
    id: string
    name: string
    quantity: number
    status: VendorStatus
    hasAvatar?: boolean
    totalBill?: number
    pickupTime?: string
    avatarUrl?: string
}

// ─── Finance ─────────────────────────────────────────────────────────
export type PaymentMethodLabel = "Online" | "Cash" | "Failed" | "In Process"

export interface VendorPayment {
    id: string
    name: string
    initials: string
    time: string
    quantity: number
    amount: number
    paymentMethod: PaymentMethodLabel
    hasAvatar?: boolean
}

// ─── Slots ───────────────────────────────────────────────────────────
export interface Slot {
    id: string
    label: string
    time?: string
}

// ─── Auth ────────────────────────────────────────────────────────────
export interface AuthUser {
    token: string
}
