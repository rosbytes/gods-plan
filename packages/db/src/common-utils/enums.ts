export const orderStatusEnum = [
    "pending", // placed, payment not yet confirmed
    "accepted", // order accepts
    "rejected", // order rejected
    "confirmed", // payment confirmed
    "preparing",
    "packing",
    "waiting_for_delivery_partner",
    "ready_for_pickup",
    "pickuped_up",
    "out_for_delivery",
    "delivered",
    "fulfilled", // all sub-orders delivered
    "partially_fulfilled", // some vendor sub-orders shipped, not all
    "cancelled",
    "refunded",
    "partially_refunded",
] as const

// enums in postgres are schema specific, not schema specific

export const adminRoleEnum = [
    "super_admin",
    "admin",
    "operator",
    "customer_support",
    "ros_counter_operator",
] as const

export const paymentStatusEnum = [
    "created", // record created, not yet sent to gateway
    "pending", // sent to gateway, awaiting user action / confirmation
    "authorized", // funds authorized/held, not captured (if using auth+capture flow)
    "captured", // money actually moved to you (this is "success")
    "failed",
    "cancelled",
    "refunded",
    "partially_refunded",
    "expired",
] as const

export const paymentMethodEnum = [
    "upi",
    "card",
    "net_banking",
    "cash",
    "wallet",
    "bank_transfer",
] as const

export const paymentProviderEnum = [
    "razorpay",
    "stripe",
    "cashfree",
    "phonepe",
    "manual", // COD / offline reconciliation
] as const
export const paymentSplitTypeEnum = [
    "vendor_payout",
    "platform_commission",
    "delivery_partner",
    "tax",
] as const

export const vendorEnum = ["market_vendor", "mandi_vendor"] as const

export const kycDocEnum = ["aadhar", "pan"] as const

export const transactionTypeEnum = ["credit", "debit"] as const

export const walletTransactionCategoryEnum = [
    "topup",
    "order_payment",
    "order_refund",
    "withdrawal",
    "admin_adjustment",
    "cashback",
] as const

export const walletTransactionStatusEnum = ["pending", "success", "failed", "cancelled"] as const

export const walletReferenceTypeEnum = ["order", "payment", "admin", "gateway"] as const

export const fulfillmentTypeEnum = ["delivery", "self_pickup"] as const
