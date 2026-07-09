export const marketMandiOrderStatusEnum = [
    "pending",
    "rejected",
    "confirmed",
    "dispatched",
    "delivered",
    "cancelled",
] as const

export const adminRoleEnum = ["super_admin", "admin", "operator"] as const

export const paymentStatusEnum = ["pending", "success", "failed", "refunded"] as const

export const paymentMethodEnum = ["upi", "card", "net_banking", "cash"] as const
