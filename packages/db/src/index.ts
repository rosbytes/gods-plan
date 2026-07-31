// db client
export { db, testDBConnection } from "./db"

// Models/Tables Schema
export { admin } from "./schema/admin"
export { city } from "./schema/city"
export { mandi } from "./schema/mandi"
export { mandiPrice } from "./schema/mandiPrice"
export { mandiStore } from "./schema/mandiStore"
export { mandiVendor } from "./schema/mandiVendor"
export { marketMandiOrder } from "./schema/marketMandiOrder"
export { marketMandiOrderStatusHistory } from "./schema/marketMandiOrderStatusHistory"
export { marketStore } from "./schema/marketStore"
export { marketVendor } from "./schema/marketVendor"
export { marketMandiOrderPayment } from "./schema/marketMandiOrderPayment"
export { veg } from "./schema/veg"
export { marketKycDoc } from "./schema/marketKycDoc"
export { mandiKycDoc } from "./schema/mandiKycDoc"
export { marketSubcriptionCharges } from "./schema/marketSubscriptionCharges"
export { mandiSubcriptionCharges } from "./schema/mandiSubscriptionCharges"

// Enums
export { adminRole } from "./schema/admin"
export { marketMandiOrderStatus } from "./schema/marketMandiOrder"
export { paymentStatus, paymentMethod } from "./schema/marketMandiOrderPayment"
export { kycDoc } from "./schema/marketKycDoc"

// Inferred Types
export type { AdminInsert, AdminSelect } from "./schema/admin"
export type { CityInsert, CitySelect } from "./schema/city"
export type { MandiInsert, MandiSelect } from "./schema/mandi"
export type { MandiPriceInsert, MandiPriceSelect } from "./schema/mandiPrice"
export type { MandiStoreInsert, MandiStoreSelect } from "./schema/mandiStore"
export type { MandiVendorInsert, MandiVendorSelect } from "./schema/mandiVendor"
export type { MarketMandiOrderInsert, MarketMandiOrderSelect } from "./schema/marketMandiOrder"
export type {
    MarketMandiOrderStatusHistoryInsert,
    MarketMandiOrderStatusHistorySelect,
} from "./schema/marketMandiOrderStatusHistory"
export type { MarketStoreInsert, MarketStoreSelect } from "./schema/marketStore"
export { timestamps } from "./common-utils/columnHelpers"
export type { MarketVendorInsert, MarketVendorSelect } from "./schema/marketVendor"
export type {
    MarketMandiOrderPaymentInsert,
    MarketMandiOrderPaymentSelect,
} from "./schema/marketMandiOrderPayment"
export type { VegInsert, VegSelect } from "./schema/veg"

// DB Utils from drizzle-orm package
export { eq, ne, and, or, gte, lte, gt, lt, ilike, desc, asc, sql } from "drizzle-orm"
export { unionAll } from "drizzle-orm/pg-core"

// Geo utility functions
export { makePoint, distance, roundMeters, withinRadius, orderByNearest } from "./functions"
