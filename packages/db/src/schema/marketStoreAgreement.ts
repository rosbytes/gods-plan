import { relations } from "drizzle-orm"
import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { marketStore } from "./marketStore"
import { marketVendor } from "./marketVendor"
import { admin } from "./admin"

export const marketStoreAgreement = pgTable("market_store_agreement", {
    id: uuid("id").primaryKey().defaultRandom(),

    vendorId: uuid("vendor_id")
        .notNull()
        .references(() => marketVendor.id, { onDelete: "cascade" }),

    storeId: uuid("store_id")
        .notNull()
        .references(() => marketStore.id, { onDelete: "cascade" }),

    agreementType: varchar("agreement_type", { length: 100 }).default("nda_and_intent").notNull(),
    title: varchar("title", { length: 255 })
        .default("NON-DISCLOSURE & PRE-COLLABORATION INTENT AGREEMENT")
        .notNull(),
    version: varchar("version", { length: 50 }).default("1.0").notNull(),

    termsSnapshot: text("terms_snapshot"),

    signerName: varchar("signer_name", { length: 255 }).notNull(),
    signerPhone: varchar("signer_phone", { length: 20 }).notNull(),

    verificationMethod: varchar("verification_method", { length: 50 }).default("otp").notNull(),
    verificationIdentifier: varchar("verification_identifier", { length: 255 }),

    signedPdfUrl: varchar("signed_pdf_url", { length: 500 }),

    signedByAdminId: uuid("signed_by_admin_id").references(() => admin.id, {
        onDelete: "set null",
    }),

    signedAt: timestamp("signed_at", { withTimezone: true }).defaultNow().notNull(),

    ...timestamps,
})

export const marketStoreAgreementRelations = relations(marketStoreAgreement, ({ one }) => ({
    marketVendor: one(marketVendor, {
        fields: [marketStoreAgreement.vendorId],
        references: [marketVendor.id],
    }),

    store: one(marketStore, {
        fields: [marketStoreAgreement.storeId],
        references: [marketStore.id],
    }),

    signedByAdmin: one(admin, {
        fields: [marketStoreAgreement.signedByAdminId],
        references: [admin.id],
    }),
}))

// Inferred types
export type MarketStoreAgreementInsert = typeof marketStoreAgreement.$inferInsert
export type MarketStoreAgreementSelect = typeof marketStoreAgreement.$inferSelect
