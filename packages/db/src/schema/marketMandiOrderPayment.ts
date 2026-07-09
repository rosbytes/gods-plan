import { relations } from "drizzle-orm"
import { integer, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { paymentStatusEnum, paymentMethodEnum } from "../common-utils/enums"
import { marketMandiOrder } from "./marketMandiOrder"

export const paymentStatus = pgEnum("payment_status", paymentStatusEnum)
export const paymentMethod = pgEnum("payment_method", paymentMethodEnum)

export const marketMandiOrderPayment = pgTable("market_mandi_order_payment", {
    id: uuid("id").primaryKey().defaultRandom(),

    orderId: uuid("order_id")
        .notNull()
        .references(() => marketMandiOrder.id, { onDelete: "restrict" }),

    // amount in paise
    amountInPaise: integer("amount_in_paise").notNull(),

    paymentStatus: paymentStatus("payment_status").notNull().default("pending"),
    paymentMethod: paymentMethod("payment_method").notNull(),

    // external transaction reference from payment gateway
    transactionId: varchar("transaction_id", { length: 255 }),

    // gateway-specific data (e.g., Razorpay order_id, payment_id)
    gatewayOrderId: varchar("gateway_order_id", { length: 255 }),
    gatewayPaymentId: varchar("gateway_payment_id", { length: 255 }),

    paidAt: timestamp("paid_at", { withTimezone: true }),

    note: varchar("note", { length: 500 }),

    ...timestamps,
})

export const marketMandiOrderPaymentRelations = relations(marketMandiOrderPayment, ({ one }) => ({
    order: one(marketMandiOrder, {
        fields: [marketMandiOrderPayment.orderId],
        references: [marketMandiOrder.id],
    }),
}))

// Inferred types
export type MarketMandiOrderPaymentInsert = typeof marketMandiOrderPayment.$inferInsert
export type MarketMandiOrderPaymentSelect = typeof marketMandiOrderPayment.$inferSelect
