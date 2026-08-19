import { useState } from "react"
import AppLayout from "@/components/layouts/AppLayout"
import PageHeader from "@/components/ui/PageHeader"
import SlotTabs from "@/components/SlotTabs"
import { CalendarIcon, RefreshIcon, CheckIcon } from "@/components/icons"
import { getPaymentMethodColor, getInitials } from "@/libs/utils"
import { getSlotDetails } from "@/data/slots"
import { trpc } from "@/libs/trpc"

function formatAmount(paise: number) {
    return (paise / 100).toLocaleString("en-IN")
}

function formatSettlementDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
    })
}

export default function Finance() {
    const todayStr = new Date().toISOString().split("T")[0]!
    const [selectedSlot, setSelectedSlot] = useState(0)

    const {
        data: finance,
        isLoading,
        isError,
        refetch,
    } = trpc.vendor.getFinanceStats.useQuery({ date: todayStr }, { refetchOnWindowFocus: false })

    const formattedDate = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
    })

    // Group slot payments by slot number
    const slotGroups: Record<number, NonNullable<typeof finance>["slotPayments"]> = {}
    if (finance) {
        for (const p of finance.slotPayments) {
            if (!slotGroups[p.slot]) slotGroups[p.slot] = []
            slotGroups[p.slot]!.push(p)
        }
    }

    const slotNumbers = Object.keys(slotGroups)
        .map(Number)
        .sort((a, b) => a - b)
    const dynamicSlots = slotNumbers.map(getSlotDetails)
    const safeIdx = selectedSlot < dynamicSlots.length ? selectedSlot : 0
    const activeSlot = dynamicSlots[safeIdx]
    const currentSlotData = activeSlot
        ? (slotGroups[parseInt(activeSlot.id.replace("slot", ""), 10)] ?? [])
        : []
    const hasData = currentSlotData.length > 0
    const hasAnyData = slotNumbers.length > 0

    return (
        <AppLayout>
            <PageHeader title="Finance" />

            {/* Date Selector */}
            <div className="mt-2 px-5">
                <div className="flex items-center gap-3 rounded-[25px] bg-white px-4 py-3">
                    <span className="font-apercu text-[20px] font-semibold text-[#444444]">
                        Today, {formattedDate}
                    </span>
                    <CalendarIcon />
                </div>
            </div>

            {/* Dashboard Card */}
            <div className="mx-5 mt-4 rounded-xl bg-white p-6">
                {isLoading ? (
                    <div className="flex flex-col gap-4">
                        <div className="h-7 w-36 animate-pulse rounded bg-gray-200" />
                        <div className="h-5 w-48 animate-pulse rounded bg-gray-100" />
                    </div>
                ) : isError ? (
                    <p className="text-sm font-medium text-red-500">Failed to load finance data</p>
                ) : (
                    <>
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <p className="font-apercu mb-1 text-[16px] font-normal text-[#444444]">
                                    Total Amount
                                </p>
                                <p className="font-apercu text-[28px] font-bold text-[#0A5445]">
                                    ₹ {hasAnyData ? formatAmount(finance!.totalAmountInPaise) : "0"}
                                </p>
                            </div>
                            <button className="cursor-pointer p-1" onClick={() => refetch()}>
                                <RefreshIcon />
                            </button>
                        </div>
                        <div className="my-4 border-t border-[#F2F3F6]" />
                        <div className="mb-4 flex justify-between">
                            <div>
                                <p className="font-apercu text-[16px] font-normal text-[#444444]">
                                    Online
                                </p>
                                <p className="font-apercu mt-1 text-[20px] font-bold text-[#444444]">
                                    ₹{" "}
                                    {hasAnyData ? formatAmount(finance!.onlineAmountInPaise) : "0"}
                                </p>
                            </div>
                            <div>
                                <p className="font-apercu text-[16px] font-normal text-[#444444]">
                                    Cash
                                </p>
                                <p className="font-apercu mt-1 text-[20px] font-bold text-[#444444]">
                                    ₹ {hasAnyData ? formatAmount(finance!.cashAmountInPaise) : "0"}
                                </p>
                            </div>
                        </div>
                        {finance?.lastSettlement && (
                            <>
                                <div className="my-4 border-t border-[#F2F3F6]" />
                                <div className="flex items-center justify-between">
                                    <p className="font-apercu text-[14px] font-semibold text-[#444444]">
                                        Last Settlement: ₹{" "}
                                        {formatAmount(finance.lastSettlement.amountInPaise)} on{" "}
                                        {formatSettlementDate(finance.lastSettlement.settledAt)}
                                    </p>
                                    <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#59AC77]">
                                        <CheckIcon />
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Slot Tabs */}
            {dynamicSlots.length > 0 && (
                <div className="mt-4">
                    <SlotTabs tabs={dynamicSlots} onTabChange={setSelectedSlot} />
                </div>
            )}

            {/* Slot Payment List */}
            <div className="mx-5 mt-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0B4E3E]" />
                    </div>
                ) : hasData ? (
                    <div className="rounded-xl bg-white p-6">
                        {currentSlotData.map((payment, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between py-3 ${
                                    index < currentSlotData.length - 1
                                        ? "border-b border-[#F2F3F6]"
                                        : ""
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-full bg-[#F2F3F6]">
                                        <span className="font-apercu text-[20px] font-bold text-[#444444]">
                                            {getInitials(payment.name)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-apercu text-[18px] font-semibold text-[#444444]">
                                            {payment.name}
                                        </p>
                                        <p className="font-apercu text-[14px] font-bold text-[#999999]">
                                            {payment.paidAt
                                                ? new Date(payment.paidAt).toLocaleTimeString(
                                                      "en-US",
                                                      {
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                          hour12: true,
                                                      },
                                                  )
                                                : "—"}
                                            , {payment.quantity} Kg
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-apercu text-[20px] font-bold text-[#444444]">
                                        ₹ {formatAmount(payment.amountInPaise)}
                                    </p>
                                    <p
                                        className={`font-apercu text-[14px] font-bold ${getPaymentMethodColor(
                                            payment.method === "cash" ? "Cash" : "Online",
                                        )}`}
                                    >
                                        {payment.method === "cash" ? "Cash" : "Online"}
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
                                    in this slot
                                </p>
                            </>
                        ) : (
                            <p className="font-apercu text-center text-[24px] font-semibold text-[#444444]">
                                No payments today
                            </p>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
