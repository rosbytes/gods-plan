import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import { trpc } from "../lib/trpc"
import { BottomNav } from "../components/layout/BottomNav"
import { VegCard } from "../components/VegCard"
import type { CatalogItem } from "../store/useCartStore"
import { useCartStore } from "../store/useCartStore"

export default function Home() {
    const navigate = useNavigate()
    const { data: vegetablesResponse, isLoading, isError } = trpc.catalog.getVegetables.useQuery()
    const { data: cartData } = trpc.cart.getCart.useQuery()
    const { getTotalItems, getTotalWeight, getEstimatedTotal, setItems } = useCartStore()

    const vegetables: CatalogItem[] | undefined = useMemo(() => {
        return vegetablesResponse?.map((item) => ({
            id: item.veg.id,
            name: item.veg.name,
            nameInHindi: item.veg.nameInHindi,
            vegPrimaryImage: item.veg.vegPrimaryImage,
            mandiStoreId: item.mandi_store.id,
            estimatedPrice: 12 + (item.veg.name.length % 5) * 5,
        }))
    }, [vegetablesResponse])

    useEffect(() => {
        if (cartData && vegetables) {
            const items: Record<string, any> = {}
            for (const item of cartData) {
                const vegItem = vegetables.find((v) => v.id === item.vegId)
                if (vegItem) {
                    items[item.vegId] = {
                        veg: vegItem,
                        quantityKg: item.quantityKg,
                    }
                }
            }
            setItems(items)
        }
    }, [cartData, vegetables, setItems])

    const totalItems = getTotalItems()
    const totalWeight = getTotalWeight()
    const estimatedTotal = getEstimatedTotal()

    return (
        <div className="relative min-h-screen bg-[#F8F9FA] pb-32">
            {/* Header */}
            <div className="sticky top-0 z-40 flex items-center justify-between bg-[#F8F9FA] px-6 py-4">
                <h1 className="text-xl font-bold text-gray-900">
                    ROS Market <span className="text-xl">👋</span>
                </h1>

                <div className="flex items-center gap-4">
                    <button className="text-gray-700 transition-colors hover:text-gray-900">
                        <Icon icon="mdi:magnify" className="h-7 w-7" />
                    </button>
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-100 ring-2 ring-blue-500/20">
                        <img
                            src="https://i.pravatar.cc/100"
                            alt="Profile"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex flex-col gap-4 px-4 pb-4">
                {/* Info Banner */}
                <div className="flex w-full flex-col items-center justify-center rounded-3xl bg-white py-6 shadow-sm ring-1 ring-gray-100">
                    <h2 className="text-[26px] font-bold text-gray-800">
                        Orders close at 11:00 PM
                    </h2>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                        Estimated prices updated at <span className="text-[#0B4E3E]">07:00 PM</span>
                    </p>
                </div>

                {/* Vegetable List */}
                <div className="mt-2 flex flex-col gap-4">
                    {isLoading && (
                        <div className="flex w-full items-center justify-center py-12">
                            <Icon
                                icon="mdi:loading"
                                className="h-8 w-8 animate-spin text-[#0B4E3E]"
                            />
                        </div>
                    )}

                    {isError && (
                        <div className="flex w-full items-center justify-center py-12 text-red-500">
                            Failed to load catalog.
                        </div>
                    )}

                    {vegetables?.map((veg) => (
                        <VegCard key={veg.id} veg={veg as CatalogItem} />
                    ))}
                </div>
            </main>

            {/* Sticky Checkout Bar */}
            {totalItems > 0 && (
                <div className="fixed right-0 bottom-18 left-0 z-40 flex flex-col gap-3 rounded-t-3xl border-t border-gray-100 bg-white px-4 py-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-sm font-semibold text-gray-500">
                            {totalItems} Items <span className="mx-1 text-gray-300">|</span>{" "}
                            {totalWeight} kg
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                            Est. Total: ₹{estimatedTotal.toLocaleString("en-IN")}
                        </span>
                    </div>

                    <button
                        onClick={() => navigate("/review-order")}
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#0B4E3E] text-lg font-semibold text-white shadow-sm transition-colors hover:bg-[#083a2e] active:bg-[#062c23]"
                    >
                        <Icon icon="mdi:check-circle-outline" className="h-6 w-6" />
                        Review Order
                    </button>
                </div>
            )}

            {/* Bottom Nav */}
            <BottomNav />
        </div>
    )
}
