import { relations } from "drizzle-orm"
import { pgTable, uuid, varchar, pgEnum } from "drizzle-orm/pg-core"
import { timestamps } from "../columnHelpers"
import { vendors } from "./vendors"
import { z } from "zod"
import { stores } from "./stores"

export const kycDocTypeArray = ["aadhar", "pan"] as const
export const ZKycDocType = z.enum(kycDocTypeArray)
export type TKycDocType = z.infer<typeof ZKycDocType>

export const kycDocType = pgEnum("kyc_doc_type", kycDocTypeArray)

export const kycDocs = pgTable("kyc_docs", {
    id: uuid("id").primaryKey().defaultRandom(),

    vendorId: uuid("vendor_id")
        .notNull()
        .references(() => vendors.id),

    storeId: uuid("store_id")
        .notNull()
        .references(() => stores.id),

    // type of kyc doc
    type: kycDocType("type").notNull(),
    docId: varchar("doc_id", { length: 255 }).notNull(),

    // url of the kyc doc
    frontUrl: varchar("front_url", { length: 500 }),
    backUrl: varchar("back_url", { length: 500 }),
    storefrontUrl: varchar("storefront_url", { length: 500 }),

    signedKycDocUrl: varchar("signed_kyc_doc_url", { length: 500 }),
    ...timestamps,
})

export const kycDocsRelations = relations(kycDocs, ({ one }) => ({
    vendor: one(vendors, {
        fields: [kycDocs.vendorId],
        references: [vendors.id],
    }),

    store: one(stores, {
        fields: [kycDocs.storeId],
        references: [stores.id],
    }),
}))
