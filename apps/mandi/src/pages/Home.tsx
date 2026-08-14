import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "@/components/layouts/AppLayout"
import { PageHeader, Button, Avatar } from "@/components/ui"
import StatsBar from "@/components/StatsBar"
import SlotTabs from "@/components/SlotTabs"
import { VendorList } from "@/components/VendorCard"
import { getSlotDetails } from "@/data/slots"
import type { Vendor } from "@/types"
import { trpc } from "@/libs/trpc"
import { toast } from "sonner"
import UpdatePriceDialog from "@/components/UpdatePriceDialog"

export default function HomePage() {
    const navigate = useNavigate()
    const [activeSlotIdx, setActiveSlotIdx] = useState(0)
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
    const [paidVendors, setPaidVendors] = useState<Set<string>>(new Set())
    const [isUpdatePriceOpen, setIsUpdatePriceOpen] = useState(false)

    const utils = trpc.useUtils()

    // Fetch stats and slot orders from our backend API
    const {
        data: stats,
        isLoading: isLoadingStats,
        isError: isStatsError,
    } = trpc.vendor.getHomeStats.useQuery(undefined, {
        refetchOnWindowFocus: false,
    })

    const updatePriceMutation = trpc.vendor.updatePrice.useMutation({
        onSuccess: () => {
            toast.success("Price updated successfully")
            utils.vendor.getHomeStats.invalidate()
            setIsUpdatePriceOpen(false)
        },
        onError: (err) => {
            toast.error(err.message || "Failed to update price")
        },
    })

    const handleUpdatePrice = async (newPrice: number) => {
        await updatePriceMutation.mutateAsync({ price: newPrice })
    }

    const todayStr = new Date().toISOString().split("T")[0]!

    const { data: groupedOrders = {}, isLoading: isLoadingOrders } =
        trpc.vendor.getGroupedOrders.useQuery(
            { date: todayStr },
            {
                refetchOnWindowFocus: false,
            },
        )

    const slotNumbers = Object.keys(groupedOrders)
        .map(Number)
        .sort((a, b) => a - b)

    const dynamicSlots = slotNumbers.map(getSlotDetails)
    const hasSlots = dynamicSlots.length > 0

    useEffect(() => {
        setActiveSlotIdx(0)
        setSelectedVendor(null)
    }, [dynamicSlots.length])

    const safeActiveSlotIdx = activeSlotIdx < dynamicSlots.length ? activeSlotIdx : 0
    const activeSlot = dynamicSlots[safeActiveSlotIdx]
    const vendors = activeSlot
        ? groupedOrders[parseInt(activeSlot.id.replace("slot", ""), 10)] || []
        : []

    const handleSelectVendor = (vendor: Vendor) => {
        setSelectedVendor(selectedVendor?.name === vendor.name ? null : vendor)
    }

    const handleCollect = () => {
        if (!selectedVendor) return
        setPaidVendors((prev) => new Set(prev).add(selectedVendor.name))
        const queryParams = new URLSearchParams({
            vendorId: selectedVendor.id,
            vendorName: selectedVendor.name,
            totalBill: selectedVendor.totalBill?.toString() || "0",
            quantity: selectedVendor.quantity.toString(),
        }).toString()
        navigate(`/payment?${queryParams}`)
    }

    const isBefore4AM = new Date().getHours() < 4
    const isPickedUp = selectedVendor
        ? selectedVendor.status === "order-picked" || paidVendors.has(selectedVendor.name)
        : false
    const view = isBefore4AM || isPickedUp ? "pickup" : "collect"

    return (
        <AppLayout>
            {/* Mobile-only page header */}
            <div className="md:hidden">
                <PageHeader title="ROS Mandi 👋" />
            </div>

            {/* Desktop-only page title */}
            <div className="mb-6 hidden flex-col md:flex">
                <h1 className="font-apercu text-3xl font-black tracking-tight text-[#111111]">
                    ROS Mandi 👋
                </h1>
                <p className="font-apercu mt-1 text-sm font-medium text-[#7A7C85]">
                    Manage your daily client orders and pick-ups
                </p>
            </div>

            <StatsBar
                pricePerKg={stats?.pricePerKg ?? null}
                totalOrders={stats?.totalOrders ?? 0}
                totalQuantityKg={stats?.totalQuantityKg ?? 0}
                isLoading={isLoadingStats}
                isError={isStatsError}
                onPriceClick={() => setIsUpdatePriceOpen(true)}
            />

            {/* Grid Layout: Left Column (Slots + List) & Right Column (Billing detail panel on desktop) */}
            <div className="mt-4 flex flex-col gap-6 lg:flex-row">
                <div className="min-w-0 grow">
                    {hasSlots && (
                        <>
                            <SlotTabs
                                tabs={dynamicSlots.map((s) => ({ label: s.label }))}
                                onTabChange={(idx) => {
                                    setActiveSlotIdx(idx)
                                    setSelectedVendor(null) // clear selected vendor when switching slots
                                }}
                            />

                            <div className="flex items-center gap-2.5 px-4 py-3">
                                <div className="h-px flex-1 bg-[#EAEBED]" />
                                <span className="rounded-full border border-[#EAEBED] bg-white px-3.5 py-1 text-[13px] font-medium whitespace-nowrap text-[#444444]">
                                    {activeSlot?.time}
                                </span>
                                <div className="h-px flex-1 bg-[#EAEBED]" />
                            </div>
                        </>
                    )}

                    <div className="px-4 md:px-0">
                        {isLoadingOrders ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0B4E3E]" />
                            </div>
                        ) : hasSlots ? (
                            <VendorList
                                vendors={vendors as Vendor[]}
                                selectedVendorId={selectedVendor?.id ?? null}
                                onSelectVendor={handleSelectVendor}
                                highlightedVendor={selectedVendor}
                                view={view}
                                onCollect={handleCollect}
                                paidVendors={paidVendors}
                            />
                        ) : (
                            <div className="flex min-h-75 flex-col items-center justify-center px-4 py-16 text-center">
                                <p className="font-apercu text-[24px] leading-8.5 font-semibold text-[#444444]">
                                    No orders found <br />
                                    for today
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right detail dashboard panel (visible on lg screens and up) */}
                <div className="hidden w-90 shrink-0 lg:block">
                    {selectedVendor ? (
                        <div className="sticky top-8 flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <Avatar
                                    name={selectedVendor.name}
                                    avatarUrl={selectedVendor.avatarUrl}
                                    size="lg"
                                />
                                <div>
                                    <h3 className="font-apercu text-lg leading-tight font-bold text-gray-900">
                                        {selectedVendor.name}
                                    </h3>
                                    <p className="font-apercu mt-0.5 text-sm font-semibold text-gray-400">
                                        ID: {selectedVendor.id}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                                <div className="flex items-center justify-between text-sm font-medium">
                                    <span className="text-gray-400">Selected Slot</span>
                                    <span className="font-semibold text-gray-900">
                                        {activeSlot?.label}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm font-medium">
                                    <span className="text-gray-400">Timings</span>
                                    <span className="font-semibold text-gray-900">
                                        {activeSlot?.time}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm font-medium">
                                    <span className="text-gray-400">Order Quantity</span>
                                    <span className="text-base font-bold text-gray-900">
                                        {selectedVendor.quantity} Kg
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm font-medium">
                                    <span className="text-gray-400">Rate per Kg</span>
                                    <span className="font-bold text-gray-900">
                                        {stats?.pricePerKg != null
                                            ? `₹ ${stats.pricePerKg} / Kg`
                                            : "—"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <span className="font-apercu text-lg font-bold text-gray-900">
                                    Total Bill:
                                </span>
                                <span className="font-apercu text-2xl font-black text-[#0B4E3E]">
                                    {selectedVendor.totalBill != null
                                        ? `₹ ${selectedVendor.totalBill.toLocaleString()}`
                                        : "—"}
                                </span>
                            </div>

                            {view === "collect" ? (
                                <Button onClick={handleCollect}>Collect Payment</Button>
                            ) : (
                                <Button variant="status">
                                    {selectedVendor.pickupTime
                                        ? `Pickup at ${selectedVendor.pickupTime}`
                                        : "Pickup time not set"}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="sticky top-8 flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
                            <svg
                                className="mb-4 h-12 w-12 text-gray-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                />
                            </svg>
                            <h3 className="font-apercu text-[16px] font-bold text-gray-900">
                                No Order Selected
                            </h3>
                            <p className="font-apercu mt-1.5 max-w-50 text-sm leading-relaxed font-medium text-gray-400">
                                Select a client order on the left to view full billing details and
                                collect payment.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <UpdatePriceDialog
                isOpen={isUpdatePriceOpen}
                onClose={() => setIsUpdatePriceOpen(false)}
                currentPrice={stats?.pricePerKg ?? null}
                onUpdate={handleUpdatePrice}
                isLoading={updatePriceMutation.isPending}
            />
        </AppLayout>
    )
}
