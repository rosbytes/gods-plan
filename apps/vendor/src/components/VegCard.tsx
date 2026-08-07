import { Icon } from "@iconify/react"
import type { CatalogItem } from "../store/useCartStore"
import { useCartStore } from "../store/useCartStore"
import { trpc } from "../lib/trpc"
import { toast } from "sonner"

export interface VegCardProps {
    veg: CatalogItem
}

export function VegCard({ veg }: VegCardProps) {
    const updateQuantity = useCartStore((state) => state.updateQuantity)
    const cartItem = useCartStore((state) => state.items[veg.id])

    const quantityKg = cartItem?.quantityKg || 0
    const itemTotal = quantityKg * veg.estimatedPrice

    const { mutate: updateCart } = trpc.cart.updateItem.useMutation({
        onError: (err) => {
            toast.error(err.message || "Failed to update cart")
        },
    })

    const handleQtyChange = (delta: number) => {
        const newQty = Math.max(0, quantityKg + delta)
        updateQuantity(veg, delta)
        updateCart({
            vegId: veg.id,
            mandiStoreId: veg.mandiStoreId,
            quantityKg: newQty,
        })
    }

    // Use a placeholder if image doesn't exist
    const imageSrc = veg.vegPrimaryImage || "https://placehold.co/100x100?text=Veg"

    return (
        <div className="flex w-full flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            {/* Header: Image, Title, Price */}
            <div className="flex items-start gap-4">
                <img
                    src={imageSrc}
                    alt={veg.name}
                    className="h-16 w-16 rounded-2xl object-cover ring-1 ring-gray-100"
                />

                <div className="flex flex-1 flex-col justify-center">
                    <h3 className="text-lg leading-tight font-bold text-gray-900">
                        {veg.name}/ {veg.nameInHindi}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                        Est. Price ₹{veg.estimatedPrice}/Kg
                    </p>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-gray-900">Est.</span>
                    <span className="text-lg font-bold text-gray-900">
                        ₹{itemTotal.toLocaleString("en-IN")}
                    </span>
                </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="flex flex-wrap items-center gap-2">
                {[10, 50, 100].map((kg) => (
                    <button
                        key={kg}
                        type="button"
                        onClick={() => handleQtyChange(kg)}
                        className="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-200 active:bg-gray-300"
                    >
                        +{kg} kg
                    </button>
                ))}
            </div>

            {/* Stepper Control */}
            <div className="flex h-14 w-full items-center justify-between rounded-2xl bg-gray-50 p-1">
                <button
                    type="button"
                    onClick={() => handleQtyChange(-1)}
                    disabled={quantityKg <= 0}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-gray-900 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:shadow-none"
                >
                    <Icon icon="mdi:minus" className="h-6 w-6" />
                </button>

                <span className="text-lg font-bold text-gray-900">{quantityKg} kg</span>

                <button
                    type="button"
                    onClick={() => handleQtyChange(1)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B4E3E] text-white shadow-sm transition-colors hover:bg-[#083a2e]"
                >
                    <Icon icon="mdi:plus" className="h-6 w-6" />
                </button>
            </div>
        </div>
    )
}
