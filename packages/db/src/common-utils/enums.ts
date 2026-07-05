import { pgEnum } from "drizzle-orm/pg-core"

const marketMandiOrderStatusEnum = [
    "pending",
    "rejected",
    "confirmed",
    "dispatched",
    "delivered",
    "cancelled",
] as const

// db Enums
export const marketMandiOrderStatus = pgEnum(
    "market_mandi_order_status",
    marketMandiOrderStatusEnum,
)

const adminRoleEnum = ["super_admin", "admin", "operator"] as const
export const adminRole = pgEnum("admin_role", adminRoleEnum)

const paymentStatusEnum = ["pending", "success", "failed", "refunded"] as const
export const paymentStatus = pgEnum("payment_status", paymentStatusEnum)

const paymentMethodEnum = ["upi", "card", "net_banking", "cash"] as const
export const paymentMethod = pgEnum("payment_method", paymentMethodEnum)
