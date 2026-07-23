import { relations } from "drizzle-orm"
import { pgTable, uuid, varchar, pgEnum } from "drizzle-orm/pg-core"
import { timestamps } from "../common-utils/columnHelpers"
import { kycDocEnum } from "../common-utils/enums"
import { mandiStore } from "./mandiStore"
import { mandiVendor } from "./mandiVendor"

export const kycDoc = pgEnum("kyc_doc", kycDocEnum)

export const mandiKycDoc = pgTable("mandi_kyc_docs", {
    id: uuid("id").primaryKey().defaultRandom(),

    vendorId: uuid("vendor_id")
        .notNull()
        .references(() => mandiVendor.id),

    storeId: uuid("store_id")
        .notNull()
        .references(() => mandiStore.id),

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

export const mandiKycDocRelations = relations(mandiKycDoc, ({ one }) => ({
    mandiVendor: one(mandiVendor, {
        fields: [mandiKycDoc.vendorId],
        references: [mandiVendor.id],
    }),

    store: one(mandiStore, {
        fields: [mandiKycDoc.storeId],
        references: [mandiStore.id],
    }),
}))
