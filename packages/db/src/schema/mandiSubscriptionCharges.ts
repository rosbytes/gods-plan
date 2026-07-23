import { relations } from "drizzle-orm"
import { pgTable, uuid, integer, varchar, pgEnum, timestamp } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { mandiVendor } from "./mandiVendor"
import { admin } from "./admin"
import { paymentMethodEnum, paymentStatusEnum } from "../common-utils/enums"

export const paymentStatus = pgEnum("payment_status", paymentStatusEnum)
export const paymentMethod = pgEnum("payment_method", paymentMethodEnum)

export const mandiSubcriptionCharges = pgTable("mandi_subcription_charges", {
    id: uuid("id").primaryKey().defaultRandom(),

    vendorId: uuid("vendor_id")
        .notNull()
        .references(() => mandiVendor.id),

    amount: integer("amount").notNull(),
    transactionId: varchar("transaction_id", { length: 255 }),

    paymentDate: timestamp("payment_date").notNull(),
    paymentStatus: paymentStatus("payment_status").notNull(),
    paymentMethod: paymentMethod("payment_method").notNull(),

    cashCollectedBy: uuid("cash_collected_by").references(() => admin.id),

    ...timestamps,
})

export const mandiSubcriptionChargesRelations = relations(mandiSubcriptionCharges, ({ one }) => ({
    vendor: one(mandiVendor, {
        fields: [mandiSubcriptionCharges.vendorId],
        references: [mandiVendor.id],
    }),
    cashCollectedBy: one(admin, {
        fields: [mandiSubcriptionCharges.cashCollectedBy],
        references: [admin.id],
    }),
}))
