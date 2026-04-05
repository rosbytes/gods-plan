import { relations } from "drizzle-orm"
import { pgTable, uuid, integer, varchar, pgEnum, timestamp } from "drizzle-orm/pg-core"
import { timestamps } from "../columnHelpers"
import { vendors } from "./vendors"
import { admin } from "./admin"

const paymentStatus = pgEnum("payment_status", ["pending", "success", "failed"])
const paymentMethod = pgEnum("payment_method", ["upi", "card", "net_banking", "cash"])

export const registrationCharges = pgTable("registration_charges", {
    id: uuid().primaryKey().defaultRandom(),

    vendorId: uuid("vendor_id")
        .notNull()
        .references(() => vendors.id),

    amount: integer("amount").notNull(),
    transactionId: varchar("transaction_id", { length: 255 }),

    paymentDate: timestamp("payment_date").notNull(),
    paymentStatus: paymentStatus("payment_status").notNull(),
    paymentMethod: paymentMethod("payment_method").notNull(),

    cashCollectedBy: uuid("cash_collected_by").references(() => admin.id),

    ...timestamps,
})

export const registrationChargesRelations = relations(registrationCharges, ({ one, many }) => ({
    vendor: one(vendors, {
        fields: [registrationCharges.vendorId],
        references: [vendors.id],
    }),
    cashCollectedBy: one(admin, {
        fields: [registrationCharges.cashCollectedBy],
        references: [admin.id],
    }),
}))
