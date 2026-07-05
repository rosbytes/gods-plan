// import { z } from "zod"

import { pgEnum } from "drizzle-orm/pg-core"

// export const vendorType = ["market_vendor", "mandi_vendor"] as const
// export const ZVendorType = z.enum(vendorType)
// export type TVendorType = z.infer<typeof ZVendorType>

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
