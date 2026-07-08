import { useState } from "react"
import AppLayout from "@/components/layouts/AppLayout"
import PageHeader from "@/components/ui/PageHeader"
import SlotTabs from "@/components/SlotTabs"
import StatsBar from "@/components/StatsBar"
import { CalendarIcon } from "@/components/icons"
import { getStatusStyle, getInitials } from "@/libs/utils"
import { SLOTS } from "@/data/slots"
import { ORDER_VENDORS } from "@/data/vendors"
import type { PayMethod } from "@/types"

function buildInitialPaid(): Map<string, PayMethod> {
    const map = new Map<string, PayMethod>()
    ORDER_VENDORS.forEach((v, i) => map.set(v.id, i % 2 === 0 ? "cash" : "online"))
    return map
}

export default function OrdersPage() {
    const [_activeSlotIdx, setActiveSlotIdx] = useState<number>(0)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [paid] = useState<Map<string, PayMethod>>(buildInitialPaid)

    const toggleExpand = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

    return (
        <AppLayout>
            <PageHeader title="All Orders" />

            <div className="px-5 pt-1 pb-2">
                <button
                    type="button"
                    className="flex items-center gap-3 rounded-[25px] bg-white px-4 py-3"
                >
                    <span className="font-apercu text-[20px] leading-[24px] font-semibold text-[#444444]">
                        18 March, 2026
                    </span>
                    <CalendarIcon />
                </button>
            </div>

            <StatsBar pricePerKg={24} totalOrders={82} totalQuantityKg={8200} />
            <SlotTabs
                tabs={SLOTS.map((s) => ({ label: s.label, time: s.time }))}
                onTabChange={setActiveSlotIdx}
            />

            <div className="mx-5">
                <div className="overflow-hidden rounded-xl bg-white">
                    {ORDER_VENDORS.map((vendor, idx) => {
                        const isExpanded = expandedId === vendor.id
                        const payMethod = paid.get(vendor.id)
                        const { label, cls } = getStatusStyle(vendor.status)

                        return (
                            <div
                                key={vendor.id}
                                className={
                                    idx < ORDER_VENDORS.length - 1
                                        ? "border-b border-[#F2F3F6]"
                                        : ""
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
                                            <span className="font-apercu text-[20px] leading-[24px] font-bold text-[#444444]">
                                                {getInitials(vendor.name)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-apercu m-0 text-[18px] leading-[22px] font-semibold text-[#444444]">
                                                {vendor.name}
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-2">
                                                <span className="font-apercu text-[14px] leading-[16px] font-bold text-[#999999]">
                                                    ID: {vendor.id}
                                                </span>
                                                <span
                                                    className={`font-apercu text-[14px] leading-[16px] font-bold ${cls}`}
                                                >
                                                    {label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="font-apercu text-[20px] leading-[24px] font-bold text-[#444444]">
                                        {vendor.quantity} Kg
                                    </span>
                                </div>

                                {isExpanded && (
                                    <div className="px-6 pb-4">
                                        <div className="mb-3 flex items-center justify-between border-t border-[#F0F0F0] py-3">
                                            <span className="font-apercu text-[18px] leading-[22px] font-semibold text-[#444444]">
                                                Total Bill:
                                            </span>
                                            <span className="font-apercu text-[18px] leading-[22px] font-bold text-[#000000]">
                                                ₹ {vendor.totalBill?.toLocaleString()}
                                            </span>
                                        </div>
                                        <div
                                            className="flex w-full items-center justify-center rounded-xl"
                                            style={{ backgroundColor: "#DAE6E3", height: 48 }}
                                        >
                                            <span className="font-apercu text-[20px] leading-[24px] font-bold text-[#0A5445]">
                                                Paid {payMethod === "cash" ? "Cash" : "Online"} (
                                                {vendor.pickupTime})
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </AppLayout>
    )
}
