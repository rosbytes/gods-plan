import { useState } from "react"
import AppLayout from "@/components/layouts/AppLayout"
import PageHeader from "@/components/ui/PageHeader"
import SlotTabs from "@/components/SlotTabs"
import StatsBar from "@/components/StatsBar"
import { CalendarIcon } from "@/components/icons"
import { getStatusStyle, getInitials } from "@/libs/utils"
import { getSlotDetails } from "@/data/slots"
import { trpc } from "@/libs/trpc"

export default function OrdersPage() {
    const todayStr = new Date().toISOString().split("T")[0]!
    const [activeSlotIdx, setActiveSlotIdx] = useState(0)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const {
        data: stats,
        isLoading: isLoadingStats,
        isError: isStatsError,
    } = trpc.vendor.getHomeStats.useQuery(undefined, { refetchOnWindowFocus: false })

    const { data: groupedOrders = {}, isLoading: isLoadingOrders } =
        trpc.vendor.getGroupedOrders.useQuery({ date: todayStr }, { refetchOnWindowFocus: false })

    const slotNumbers = Object.keys(groupedOrders)
        .map(Number)
        .sort((a, b) => a - b)
    const dynamicSlots = slotNumbers.map(getSlotDetails)
    const hasSlots = dynamicSlots.length > 0

    const safeIdx = activeSlotIdx < dynamicSlots.length ? activeSlotIdx : 0
    const activeSlot = dynamicSlots[safeIdx]
    const vendors = activeSlot
        ? (groupedOrders[parseInt(activeSlot.id.replace("slot", ""), 10)] ?? [])
        : []

    const toggleExpand = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

    const formattedDate = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })

    return (
        <AppLayout>
            <PageHeader title="All Orders" />

            <div className="px-5 pt-1 pb-2">
                <div className="flex items-center gap-3 rounded-[25px] bg-white px-4 py-3">
                    <span className="font-apercu text-[20px] leading-6 font-semibold text-[#444444]">
                        {formattedDate}
                    </span>
                    <CalendarIcon />
                </div>
            </div>

            <StatsBar
                pricePerKg={stats?.pricePerKg ?? null}
                totalOrders={stats?.totalOrders ?? 0}
                totalQuantityKg={stats?.totalQuantityKg ?? 0}
                isLoading={isLoadingStats}
                isError={isStatsError}
            />

            {hasSlots && (
                <SlotTabs
                    tabs={dynamicSlots.map((s) => ({ label: s.label, time: s.time }))}
                    onTabChange={(idx) => {
                        setActiveSlotIdx(idx)
                        setExpandedId(null)
                    }}
                />
            )}

            <div className="mx-5 mt-2">
                {isLoadingOrders ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0B4E3E]" />
                    </div>
                ) : !hasSlots ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="font-apercu text-[24px] font-semibold text-[#444444]">
                            No orders found
                            <br />
                            for today
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl bg-white">
                        {vendors.map((vendor, idx) => {
                            const isExpanded = expandedId === vendor.id
                            const { label, cls } = getStatusStyle(vendor.status)

                            return (
                                <div
                                    key={vendor.id}
                                    className={
                                        idx < vendors.length - 1 ? "border-b border-[#F2F3F6]" : ""
                                    }
                                >
                                    <div
                                        onClick={() => toggleExpand(vendor.id)}
                                        className="flex cursor-pointer items-center justify-between px-6 py-3"
                                    >
                                        <div className="flex flex-1 items-center gap-4">
                                            <div
                                                className="flex shrink-0 items-center justify-center rounded-full bg-[#F2F3F6]"
                                                style={{ width: 42, height: 42 }}
                                            >
                                                <span className="font-apercu text-[20px] leading-6 font-bold text-[#444444]">
                                                    {getInitials(vendor.name)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-apercu m-0 text-[18px] leading-5.5 font-semibold text-[#444444]">
                                                    {vendor.name}
                                                </p>
                                                <div className="mt-0.5 flex items-center gap-2">
                                                    <span className="font-apercu text-[14px] leading-4 font-bold text-[#999999]">
                                                        ID: {vendor.id}
                                                    </span>
                                                    <span
                                                        className={`font-apercu text-[14px] leading-4 font-bold ${cls}`}
                                                    >
                                                        {label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="font-apercu text-[20px] leading-6 font-bold text-[#444444]">
                                            {vendor.quantity} Kg
                                        </span>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-6 pb-4">
                                            <div className="mb-3 flex items-center justify-between border-t border-[#F0F0F0] py-3">
                                                <span className="font-apercu text-[18px] leading-5.5 font-semibold text-[#444444]">
                                                    Total Bill:
                                                </span>
                                                <span className="font-apercu text-[18px] leading-5.5 font-bold text-[#000000]">
                                                    ₹ {vendor.totalBill?.toLocaleString() ?? "—"}
                                                </span>
                                            </div>
                                            {vendor.pickupTime && (
                                                <div
                                                    className="flex w-full items-center justify-center rounded-xl"
                                                    style={{
                                                        backgroundColor: "#DAE6E3",
                                                        height: 48,
                                                    }}
                                                >
                                                    <span className="font-apercu text-[20px] leading-6 font-bold text-[#0A5445]">
                                                        Pickup at {vendor.pickupTime}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
