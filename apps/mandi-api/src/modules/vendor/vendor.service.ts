import {
    db,
    eq,
    desc,
    and,
    gte,
    lte,
    ilike,
    or,
    mandiPrice,
    mandiStore,
    mandiVendor,
    mandiKycDoc,
    marketMandiOrderItem,
    marketMandiOrder,
    marketMandiPayment,
    marketMandiPaymentSplit,
    marketStore,
    veg,
} from "@ros/db"

export const getMandiStore = async (vendorId: string) => {
    const [store] = await db.select().from(mandiStore).where(eq(mandiStore.vendorId, vendorId))
    return store
}

export const getVendorById = async (vendorId: string) => {
    const [vendor] = await db.select().from(mandiVendor).where(eq(mandiVendor.id, vendorId))
    return vendor
}

export const getPrice = async (storeId: string) => {
    const [priceRecord] = await db
        .select()
        .from(mandiPrice)
        .where(eq(mandiPrice.mandiStoreId, storeId))
        .orderBy(desc(mandiPrice.createdAt))
        .limit(1)
    return priceRecord
}

export const createPrice = async (storeId: string, vegId: string, priceInPaise: number) => {
    const [inserted] = await db
        .insert(mandiPrice)
        .values({
            mandiStoreId: storeId,
            vegId: vegId,
            price: priceInPaise,
        })
        .returning()
    return inserted
}

export const getOrders = async (storeId: string) => {
    const orders = await db
        .select()
        .from(marketMandiOrderItem)
        .where(eq(marketMandiOrderItem.mandiStoreId, storeId))
    return orders
}

/** Full profile: vendor + store + veg + latest KYC */
export const getFullProfile = async (vendorId: string) => {
    const vendor = await getVendorById(vendorId)
    if (!vendor) return null

    const store = await getMandiStore(vendorId)

    let vegDetails: { name: string; nameInHindi: string | null } | null = null
    if (store) {
        const [v] = await db
            .select({ name: veg.name, nameInHindi: veg.nameInHindi })
            .from(veg)
            .where(eq(veg.id, store.vegId))
        vegDetails = v ?? null
    }

    let kyc: { type: string; docId: string } | null = null
    if (store) {
        const [kycRow] = await db
            .select({ type: mandiKycDoc.type, docId: mandiKycDoc.docId })
            .from(mandiKycDoc)
            .where(eq(mandiKycDoc.vendorId, vendorId))
            .orderBy(desc(mandiKycDoc.createdAt))
            .limit(1)
        kyc = kycRow ?? null
    }

    return {
        id: vendor.id,
        fullName: vendor.fullName,
        primaryPhone: vendor.primaryPhone,
        alternatePhone: vendor.alternatePhone ?? null,
        storeName: store?.storeName ?? null,
        storeImage: store?.storeImage ?? null,
        storeAddress: store?.fullAddress ?? null,
        vegName: vegDetails?.name ?? null,
        vegNameInHindi: vegDetails?.nameInHindi ?? null,
        kycType: kyc?.type ?? null,
        kycDocId: kyc?.docId ?? null,
    }
}

/** Finance stats for a mandi store on a specific date */
export const getFinanceStatsForStore = async (storeId: string, date: string) => {
    const start = new Date(date)
    start.setUTCHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setUTCHours(23, 59, 59, 999)

    const payments = await db
        .select({
            amount: marketMandiPayment.amount,
            method: marketMandiPayment.method,
            paidAt: marketMandiPayment.paidAt,
        })
        .from(marketMandiPayment)
        .innerJoin(marketMandiOrder, eq(marketMandiPayment.orderId, marketMandiOrder.id))
        .innerJoin(marketMandiOrderItem, eq(marketMandiOrderItem.orderId, marketMandiOrder.id))
        .where(
            and(
                eq(marketMandiOrderItem.mandiStoreId, storeId),
                eq(marketMandiPayment.status, "captured"),
                gte(marketMandiPayment.paidAt, start),
                lte(marketMandiPayment.paidAt, end),
            ),
        )

    let totalAmount = 0
    let onlineAmount = 0
    let cashAmount = 0
    for (const p of payments) {
        totalAmount += p.amount
        if (p.method === "cash") cashAmount += p.amount
        else onlineAmount += p.amount
    }

    // Last settled split for this vendor (as mandi store)
    const [lastSplit] = await db
        .select({
            amount: marketMandiPaymentSplit.amount,
            settledAt: marketMandiPaymentSplit.settledAt,
        })
        .from(marketMandiPaymentSplit)
        .where(
            and(
                eq(marketMandiPaymentSplit.vendorId, storeId),
                eq(marketMandiPaymentSplit.settled, true),
            ),
        )
        .orderBy(desc(marketMandiPaymentSplit.settledAt))
        .limit(1)

    // Slot-level payment breakdown
    const slotPayments = await db
        .select({
            slot: marketStore.slot,
            orderCode: marketMandiOrder.orderCode,
            marketStoreName: marketMandiOrder.marketStoreName,
            quantityInGram: marketMandiOrderItem.quantityInGram,
            amount: marketMandiPayment.amount,
            method: marketMandiPayment.method,
            paidAt: marketMandiPayment.paidAt,
        })
        .from(marketMandiPayment)
        .innerJoin(marketMandiOrder, eq(marketMandiPayment.orderId, marketMandiOrder.id))
        .innerJoin(marketStore, eq(marketMandiOrder.marketStoreId, marketStore.id))
        .innerJoin(marketMandiOrderItem, eq(marketMandiOrderItem.orderId, marketMandiOrder.id))
        .where(
            and(
                eq(marketMandiOrderItem.mandiStoreId, storeId),
                eq(marketMandiPayment.status, "captured"),
                gte(marketMandiPayment.paidAt, start),
                lte(marketMandiPayment.paidAt, end),
            ),
        )
        .orderBy(marketStore.slot, marketMandiPayment.paidAt)

    return {
        totalAmountInPaise: totalAmount,
        onlineAmountInPaise: onlineAmount,
        cashAmountInPaise: cashAmount,
        lastSettlement: lastSplit?.settledAt
            ? {
                  amountInPaise: lastSplit.amount,
                  settledAt: lastSplit.settledAt.toISOString(),
              }
            : null,
        slotPayments: slotPayments.map((p) => ({
            slot: p.slot ?? 1,
            name: p.marketStoreName,
            quantity: p.quantityInGram / 1000,
            amountInPaise: p.amount,
            method: p.method ?? "upi",
            paidAt: p.paidAt?.toISOString() ?? null,
        })),
    }
}

/** Search orders by market store name or order code (case-insensitive) */
export const searchOrdersByQuery = async (storeId: string, query: string) => {
    const results = await db
        .select({
            orderCode: marketMandiOrder.orderCode,
            marketStoreName: marketMandiOrder.marketStoreName,
            quantityInGram: marketMandiOrderItem.quantityInGram,
            status: marketMandiOrderItem.status,
            totalAmount: marketMandiOrderItem.totalAmount,
            createdAt: marketMandiOrderItem.createdAt,
            slot: marketStore.slot,
        })
        .from(marketMandiOrderItem)
        .innerJoin(marketMandiOrder, eq(marketMandiOrderItem.orderId, marketMandiOrder.id))
        .innerJoin(marketStore, eq(marketMandiOrder.marketStoreId, marketStore.id))
        .where(
            and(
                eq(marketMandiOrderItem.mandiStoreId, storeId),
                or(
                    ilike(marketMandiOrder.marketStoreName, `%${query}%`),
                    ilike(marketMandiOrder.orderCode, `%${query}%`),
                ),
            ),
        )
        .orderBy(desc(marketMandiOrderItem.createdAt))
        .limit(50)

    return results
}
