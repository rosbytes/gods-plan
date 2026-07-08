import { useState } from "react"
import AppLayout from "@/components/layouts/AppLayout"
import PageHeader from "@/components/ui/PageHeader"
import SlotTabs from "@/components/SlotTabs"
import { CalendarIcon, RefreshIcon, CheckIcon } from "@/components/icons"
import { getPaymentMethodColor } from "@/libs/utils"
import { FINANCE_SLOTS } from "@/data/slots"
import { FINANCE_VENDOR_DATA } from "@/data/vendors"

export default function Finance() {
    const [selectedSlot, setSelectedSlot] = useState(0)
    const selectedDate = "Today, 19 March"

    const totalAmount = 196800
    const onlineAmount = 137760
    const cashAmount = 59040
    const lastSettlement = "₹ 2,40,000 on 18 March"

    const currentSlotData = FINANCE_VENDOR_DATA[`slot${selectedSlot + 1}`] || []
    const hasData = currentSlotData.length > 0
    const hasAnyData = Object.values(FINANCE_VENDOR_DATA).some((slot) => slot.length > 0)

    return (
        <AppLayout>
            <PageHeader title="Finance" />

            {/* Date Selector */}
            <div className="mt-2 px-5">
                <button className="flex items-center gap-3 rounded-[25px] bg-white px-4 py-3">
                    <span className="font-apercu text-[20px] font-semibold text-[#444444]">
                        {selectedDate}
                    </span>
                    <CalendarIcon />
                </button>
            </div>

            {/* Dashboard Card */}
            <div className="mx-5 mt-4 rounded-xl bg-white p-6">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <p className="font-apercu mb-1 text-[16px] font-normal text-[#444444]">
                            Total Amount
                        </p>
                        <p className="font-apercu text-[28px] font-bold text-[#0A5445]">
                            ₹ {hasAnyData ? totalAmount.toLocaleString("en-IN") : "0"}
                        </p>
                    </div>
                    <button className="p-1">
                        <RefreshIcon />
                    </button>
                </div>
                <div className="my-4 border-t border-[#F2F3F6]" />
                <div className="mb-4 flex justify-between">
                    <div>
                        <p className="font-apercu text-[16px] font-normal text-[#444444]">Online</p>
                        <p className="font-apercu mt-1 text-[20px] font-bold text-[#444444]">
                            ₹ {hasAnyData ? onlineAmount.toLocaleString("en-IN") : "0"}
                        </p>
                    </div>
                    <div>
                        <p className="font-apercu text-[16px] font-normal text-[#444444]">Cash</p>
                        <p className="font-apercu mt-1 text-[20px] font-bold text-[#444444]">
                            ₹ {hasAnyData ? cashAmount.toLocaleString("en-IN") : "0"}
                        </p>
                    </div>
                </div>
                <div className="my-4 border-t border-[#F2F3F6]" />
                <div className="flex items-center justify-between">
                    <p className="font-apercu text-[14px] font-semibold text-[#444444]">
                        Last Settlement: {lastSettlement}
                    </p>
                    <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#59AC77]">
                        <CheckIcon />
                    </div>
                </div>
            </div>

            {/* Slot Tabs */}
            <div className="mt-4">
                <SlotTabs tabs={FINANCE_SLOTS} onTabChange={setSelectedSlot} />
            </div>

            {/* Order Details or Empty State */}
            <div className="mx-5 mt-4">
                {hasData ? (
                    <div className="rounded-xl bg-white p-6">
                        {currentSlotData.map((vendor, index) => (
                            <div
                                key={vendor.id}
                                className={`flex items-center justify-between py-3 ${
                                    index < currentSlotData.length - 1
                                        ? "border-b border-[#F2F3F6]"
                                        : ""
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-full bg-[#F2F3F6]">
                                        <span className="font-apercu text-[20px] font-bold text-[#444444]">
                                            {vendor.initials}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-apercu text-[18px] font-semibold text-[#444444]">
                                            {vendor.name}
                                        </p>
                                        <p className="font-apercu text-[14px] font-bold text-[#999999]">
                                            {vendor.time}, {vendor.quantity} Kg
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-apercu text-[20px] font-bold text-[#444444]">
                                        ₹ {vendor.amount.toLocaleString("en-IN")}
                                    </p>
                                    <p
                                        className={`font-apercu text-[14px] font-bold ${getPaymentMethodColor(vendor.paymentMethod)}`}
                                    >
                                        {vendor.paymentMethod}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        {hasAnyData ? (
                            <>
                                <p className="font-apercu mb-2 text-center text-[24px] font-semibold text-[#444444]">
                                    No payments found
                                </p>
                                <p className="font-apercu text-center text-[24px] font-semibold text-[#444444]">
                                    in this slot,
                                </p>
                                <p className="font-apercu mt-2 text-center text-[24px] font-semibold text-[#444444]">
                                    Check next slot ...
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="font-apercu mb-2 text-center text-[24px] font-semibold text-[#444444]">
                                    No payments on
                                </p>
                                <p className="font-apercu text-center text-[24px] font-semibold text-[#444444]">
                                    this date ...
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
