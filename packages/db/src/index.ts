// db client
export { db, testDBConnection } from "./db"

// Models/Tables Schema
export { admin } from "./schema/admin"
export { city } from "./schema/city"
export { mandi } from "./schema/mandi"
export { mandiCounter } from "./schema/mandiCounter"
export { mandiPrice } from "./schema/mandiPrice"
export { mandiStore } from "./schema/mandiStore"
export { mandiVendor } from "./schema/mandiVendor"
export { marketMandiOrder } from "./schema/marketMandiOrder"
export { marketMandiOrderItem } from "./schema/marketMandiOrderItem"
export { marketMandiOrderStatusHistory } from "./schema/marketMandiOrderStatusHistory"
export { marketStore } from "./schema/marketStore"
export { marketVendor } from "./schema/marketVendor"
export { marketVendorWallet } from "./schema/marketVendorWallet"
export { marketVendorWalletTransaction } from "./schema/marketVendorWalletTransaction"
export { marketVendorCart } from "./schema/marketVendorCart"
export { veg } from "./schema/veg"
export { marketKycDoc } from "./schema/marketKycDoc"
export { mandiKycDoc } from "./schema/mandiKycDoc"
export { marketSubcriptionCharges } from "./schema/marketSubscriptionCharges"
export { mandiSubcriptionCharges } from "./schema/mandiSubscriptionCharges"
export { marketStoreAgreement, marketStoreAgreementRelations } from "./schema/marketStoreAgreement"
export { mandiStoreAgreement, mandiStoreAgreementRelations } from "./schema/mandiStoreAgreement"

// Payment tables
export { marketMandiPayment } from "./schema/marketMandiPayment"
export { marketMandiPaymentStatusHistory } from "./schema/marketMandiPaymentStatusHistory"
export { marketMandiPaymentWebhookEvent } from "./schema/marketMandiPaymentWebhookEvent"
export { marketMandiPaymentSplit } from "./schema/marketMandiPaymentSplit"

// Enums (canonical source: schema/enums.ts)
export {
    orderStatus,
    fulfillmentType,
    paymentStatus,
    paymentMethod,
    paymentProvider,
    paymentSplitType,
    transactionType,
    walletTransactionCategory,
    walletTransactionStatus,
    walletReferenceType,
} from "./schema/enums"
export { adminRole } from "./schema/admin"
export { kycDoc } from "./schema/marketKycDoc"

// Inferred Types
export type { AdminInsert, AdminSelect } from "./schema/admin"
export type { CityInsert, CitySelect } from "./schema/city"
export type { MandiInsert, MandiSelect } from "./schema/mandi"
export type { MandiCounterInsert, MandiCounterSelect } from "./schema/mandiCounter"
export type { MandiPriceInsert, MandiPriceSelect } from "./schema/mandiPrice"
export type { MandiStoreInsert, MandiStoreSelect } from "./schema/mandiStore"
export type { MandiVendorInsert, MandiVendorSelect } from "./schema/mandiVendor"
export type { MarketMandiOrderInsert, MarketMandiOrderSelect } from "./schema/marketMandiOrder"
export type {
    MarketMandiOrderItemInsert,
    MarketMandiOrderItemSelect,
} from "./schema/marketMandiOrderItem"
export type {
    MarketMandiOrderStatusHistoryInsert,
    MarketMandiOrderStatusHistorySelect,
} from "./schema/marketMandiOrderStatusHistory"
export type { MarketStoreInsert, MarketStoreSelect } from "./schema/marketStore"
export { timestamps } from "./common-utils/columnHelpers"
export type { MarketVendorInsert, MarketVendorSelect } from "./schema/marketVendor"
export type {
    MarketVendorWalletInsert,
    MarketVendorWalletSelect,
} from "./schema/marketVendorWallet"
export type {
    MarketVendorWalletTransactionInsert,
    MarketVendorWalletTransactionSelect,
} from "./schema/marketVendorWalletTransaction"
export type { MarketVendorCartInsert, MarketVendorCartSelect } from "./schema/marketVendorCart"
export type {
    MarketMandiPaymentInsert,
    MarketMandiPaymentSelect,
} from "./schema/marketMandiPayment"
export type {
    MarketMandiPaymentStatusHistoryInsert,
    MarketMandiPaymentStatusHistorySelect,
} from "./schema/marketMandiPaymentStatusHistory"
export type {
    MarketMandiPaymentWebhookEventInsert,
    MarketMandiPaymentWebhookEventSelect,
} from "./schema/marketMandiPaymentWebhookEvent"
export type {
    MarketMandiPaymentSplitInsert,
    MarketMandiPaymentSplitSelect,
} from "./schema/marketMandiPaymentSplit"
export type {
    MarketStoreAgreementInsert,
    MarketStoreAgreementSelect,
} from "./schema/marketStoreAgreement"
export type {
    MandiStoreAgreementInsert,
    MandiStoreAgreementSelect,
} from "./schema/mandiStoreAgreement"
export type { VegInsert, VegSelect } from "./schema/veg"

// DB Utils from drizzle-orm package
export { eq, ne, and, or, gte, lte, gt, lt, not, ilike, desc, asc, sql, inArray } from "drizzle-orm"
export { unionAll } from "drizzle-orm/pg-core"

// Geo utility functions
export { makePoint, distance, roundMeters, withinRadius, orderByNearest } from "./functions"
