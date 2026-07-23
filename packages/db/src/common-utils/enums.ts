export const orderStatusEnum = [
    "pending",
    "rejected",
    "confirmed",
    "preparing",
    "packing",
    "waiting_for_delivery_partner",
    "ready_for_pickup",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "refunded",
] as const

// enums in postgres are schema specific, not schema specific

export const adminRoleEnum = ["super_admin", "admin", "operator"] as const

export const paymentStatusEnum = ["pending", "success", "failed", "refunded"] as const

export const paymentMethodEnum = ["upi", "card", "net_banking", "cash"] as const

export const vendorEnum = ["market_vendor", "mandi_vendor"] as const

export const kycDocEnum = ["aadhar", "pan"] as const
