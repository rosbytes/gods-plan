import { relations } from "drizzle-orm"
import { pgTable, uuid, varchar, pgEnum } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { kycDocEnum } from "../common-utils/enums"
import { marketStore } from "./marketStore"
import { marketVendor } from "./marketVendor"

export const kycDoc = pgEnum("kyc_doc", kycDocEnum)

export const marketKycDoc = pgTable("market_kyc_docs", {
    id: uuid("id").primaryKey().defaultRandom(),

    vendorId: uuid("vendor_id")
        .notNull()
        .references(() => marketVendor.id),

    storeId: uuid("store_id")
        .notNull()
        .references(() => marketStore.id),

    // type of kyc doc
    type: kycDoc("type").notNull(),
    docId: varchar("doc_id", { length: 255 }).notNull(),

    // url of the kyc doc
    frontUrl: varchar("front_url", { length: 500 }),
    backUrl: varchar("back_url", { length: 500 }),
    storefrontUrl: varchar("storefront_url", { length: 500 }),

    signedKycDocUrl: varchar("signed_kyc_doc_url", { length: 500 }),
    ...timestamps,
})

export const marketKycDocRelations = relations(marketKycDoc, ({ one }) => ({
    marketVendor: one(marketVendor, {
        fields: [marketKycDoc.vendorId],
        references: [marketVendor.id],
    }),

    store: one(marketStore, {
        fields: [marketKycDoc.storeId],
        references: [marketStore.id],
    }),
}))
