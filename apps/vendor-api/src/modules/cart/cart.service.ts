import { db, eq, and, marketVendorCart } from "@ros/db"
import { findVendorStore } from "../catalog/catalog.service"
import type { TCartItem } from "./cart.schema"

export async function getCartForVendor(vendorId: string): Promise<TCartItem[]> {
    const store = await findVendorStore(vendorId)
    if (!store) {
        return []
    }

    const cartItems = await db
        .select()
        .from(marketVendorCart)
        .where(eq(marketVendorCart.marketStoreId, store.id))

    return cartItems.map((item) => ({
        id: item.id,
        marketStoreId: item.marketStoreId,
        mandiStoreId: item.mandiStoreId,
        vegId: item.vegId,
        quantityKg: item.quantityInGram / 1000,
    }))
}

export async function updateCartItem(
    vendorId: string,
    mandiStoreId: string,
    vegId: string,
    quantityKg: number,
): Promise<void> {
    const store = await findVendorStore(vendorId)
    if (!store) {
        throw new Error("Vendor store not found")
    }

    const quantityInGram = Math.round(quantityKg * 1000)

    if (quantityInGram === 0) {
        // Delete item from cart if quantity is 0
        await db
            .delete(marketVendorCart)
            .where(
                and(
                    eq(marketVendorCart.marketStoreId, store.id),
                    eq(marketVendorCart.mandiStoreId, mandiStoreId),
                    eq(marketVendorCart.vegId, vegId),
                ),
            )
        return
    }

    // Check if item already exists to update, otherwise insert
    const existing = await db
        .select()
        .from(marketVendorCart)
        .where(
            and(
                eq(marketVendorCart.marketStoreId, store.id),
                eq(marketVendorCart.mandiStoreId, mandiStoreId),
                eq(marketVendorCart.vegId, vegId),
            ),
        )

    if (existing.length > 0) {
        await db
            .update(marketVendorCart)
            .set({ quantityInGram, updatedAt: new Date() })
            .where(
                and(
                    eq(marketVendorCart.marketStoreId, store.id),
                    eq(marketVendorCart.mandiStoreId, mandiStoreId),
                    eq(marketVendorCart.vegId, vegId),
                ),
            )
    } else {
        await db.insert(marketVendorCart).values({
            marketStoreId: store.id,
            mandiStoreId,
            vegId,
            quantityInGram,
        })
    }
}
