import { create } from "zustand"
import type { VegSelect } from "@ros/db"

// Extended type from backend query
export type CatalogItem = Pick<VegSelect, "id" | "name" | "nameInHindi" | "vegPrimaryImage"> & {
    estimatedPrice: number
    mandiStoreId: string
}

interface CartItem {
    veg: CatalogItem
    quantityKg: number
}

interface CartState {
    items: Record<string, CartItem>

    // actions
    setItems: (items: Record<string, CartItem>) => void
    updateQuantity: (veg: CatalogItem, deltaKg: number, absolute?: boolean) => void
    clearCart: () => void

    // selectors
    getTotalItems: () => number
    getTotalWeight: () => number
    getEstimatedTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
    items: {},

    setItems: (items) => set({ items }),

    updateQuantity: (veg, deltaKg, absolute = false) => {
        set((state) => {
            const currentItem = state.items[veg.id]
            const currentQty = currentItem?.quantityKg || 0

            const newQty = absolute ? deltaKg : Math.max(0, currentQty + deltaKg)

            const newItems = { ...state.items }

            if (newQty === 0) {
                delete newItems[veg.id]
            } else {
                newItems[veg.id] = {
                    veg,
                    quantityKg: newQty,
                }
            }

            return { items: newItems }
        })
    },

    clearCart: () => set({ items: {} }),

    getTotalItems: () => {
        return Object.keys(get().items).length
    },

    getTotalWeight: () => {
        return Object.values(get().items).reduce((acc, item) => acc + item.quantityKg, 0)
    },

    getEstimatedTotal: () => {
        return Object.values(get().items).reduce((acc, item) => {
            return acc + item.veg.estimatedPrice * item.quantityKg
        }, 0)
    },
}))
