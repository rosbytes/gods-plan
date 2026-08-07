import { pgEnum } from "drizzle-orm/pg-core"
import {
    orderStatusEnum,
    paymentStatusEnum,
    paymentMethodEnum,
    paymentProviderEnum,
    paymentSplitTypeEnum,
    transactionTypeEnum,
    walletTransactionCategoryEnum,
    walletTransactionStatusEnum,
    walletReferenceTypeEnum,
    fulfillmentTypeEnum,
} from "../common-utils/enums"

// ── Order lifecycle ──────────────────────────────────────────────────
export const orderStatus = pgEnum("order_status", orderStatusEnum)
export const fulfillmentType = pgEnum("fulfillment_type", fulfillmentTypeEnum)

// ── Payment ──────────────────────────────────────────────────────────
export const paymentStatus = pgEnum("payment_status", paymentStatusEnum)
export const paymentMethod = pgEnum("payment_method", paymentMethodEnum)
export const paymentProvider = pgEnum("payment_provider", paymentProviderEnum)
export const paymentSplitType = pgEnum("payment_split_type", paymentSplitTypeEnum)

// ── Wallet ───────────────────────────────────────────────────────────
export const transactionType = pgEnum("wallet_transaction_type", transactionTypeEnum)
export const walletTransactionCategory = pgEnum(
    "wallet_transaction_category",
    walletTransactionCategoryEnum,
)
export const walletTransactionStatus = pgEnum(
    "wallet_transaction_status",
    walletTransactionStatusEnum,
)
export const walletReferenceType = pgEnum("wallet_reference_type", walletReferenceTypeEnum)
