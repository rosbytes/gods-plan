import { relations } from "drizzle-orm"
import { pgTable, uuid, integer, varchar, timestamp } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { mandiVendor } from "./mandiVendor"
import { admin } from "./admin"
import { paymentMethod, paymentStatus } from "./enums"

export const mandiSubcriptionCharges = pgTable("mandi_subcription_charges", {
    id: uuid("id").primaryKey().defaultRandom(),

    vendorId: uuid("vendor_id")
        .notNull()
        .references(() => mandiVendor.id),

    amount: integer("amount").notNull(),

    // gateway-specific data (e.g., Razorpay order_id, payment_id)
    gatewayOrderId: varchar("gateway_order_id", { length: 255 }),
    gatewayPaymentId: varchar("gateway_payment_id", { length: 255 }),

    paymentDate: timestamp("payment_date", { withTimezone: true }).notNull(),
    paymentStatus: paymentStatus("payment_status").notNull(),
    paymentMethod: paymentMethod("payment_method").notNull(),

    paymentCollectedBy: uuid("payment_collected_by")
        .references(() => admin.id)
        .notNull(),
    note: varchar("note", { length: 500 }),

    ...timestamps,
})

export const mandiSubcriptionChargesRelations = relations(mandiSubcriptionCharges, ({ one }) => ({
    vendor: one(mandiVendor, {
        fields: [mandiSubcriptionCharges.vendorId],
        references: [mandiVendor.id],
    }),
    paymentCollectedBy: one(admin, {
        fields: [mandiSubcriptionCharges.paymentCollectedBy],
        references: [admin.id],
    }),
}))
