// src/pages/Finance.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import BottomNavbar from "@/components/BottomNavbar"
import SlotTabs from "@/components/SlotTabs"

interface VendorPayment {
    id: string
    name: string
    initials: string
    time: string
    quantity: number
    amount: number
    paymentMethod: "Online" | "Cash" | "Failed" | "In Process"
    hasAvatar?: boolean
}

const SLOTS = [
    { id: "slot1", label: "Slot 1" },
    { id: "slot2", label: "Slot 2" },
    { id: "slot3", label: "Slot 3" },
    { id: "slot4", label: "Slot 4" },
    { id: "slot5", label: "Slot 5" },
    { id: "slot6", label: "Slot 6" },
    { id: "slot7", label: "Slot 7" },
    { id: "slot8", label: "Slot 8" },
]

const VENDOR_DATA: Record<string, VendorPayment[]> = {
    slot1: [
        {
            id: "1",
            name: "Sharma Vegetables",
            initials: "SV",
            time: "04:01 AM",
            quantity: 100,
            amount: 2400,
            paymentMethod: "Online",
            hasAvatar: true,
        },
        {
            id: "2",
            name: "Aarya Vegetables",
            initials: "AV",
            time: "04:03 AM",
            quantity: 80,
            amount: 1920,
            paymentMethod: "Cash",
        },
        {
            id: "3",
            name: "Bhati Vegetables",
            initials: "BV",
            time: "04:05 AM",
            quantity: 60,
            amount: 1440,
            paymentMethod: "Online",
        },
        {
            id: "4",
            name: "Bhawani Vegetables",
            initials: "BV",
            time: "04:05 AM",
            quantity: 120,
            amount: 2880,
            paymentMethod: "Cash",
        },
        {
            id: "5",
            name: "Sid Vegetables",
            initials: "SV",
            time: "04:06 AM",
            quantity: 140,
            amount: 3360,
            paymentMethod: "Online",
        },
        {
            id: "6",
            name: "Rehman Vegetables",
            initials: "RV",
            time: "04:07 AM",
            quantity: 100,
            amount: 2400,
            paymentMethod: "Online",
        },
        {
            id: "7",
            name: "Hamza Vegetables",
            initials: "HV",
            time: "04:09 AM",
            quantity: 80,
            amount: 1920,
            paymentMethod: "Cash",
        },
        {
            id: "8",
            name: "Maanvi Vegetables",
            initials: "MV",
            time: "04:11 AM",
            quantity: 60,
            amount: 1440,
            paymentMethod: "Online",
        },
    ],
    slot2: [],
    slot3: [],
    slot4: [],
    slot5: [],
    slot6: [],
    slot7: [],
    slot8: [],
}

function SearchIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#444444" strokeWidth="1.8" />
            <path d="M20 20L17 17" stroke="#444444" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    )
}

function CalendarIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="#444444" strokeWidth="1.8" />
            <path
                d="M16 2V6M8 2V6M3 10H21"
                stroke="#444444"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    )
}

function RefreshIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M8.99999 18C6.48749 18 4.35937 17.1281 2.61562 15.3844C0.871874 13.6406 0 11.5125 0 9C0 6.4875 0.871874 4.35938 2.61562 2.61563C4.35937 0.871878 6.48749 3.87931e-06 8.99999 3.87931e-06C10.2937 3.87931e-06 11.5312 0.267004 12.7125 0.801004C13.8937 1.335 14.9062 2.09925 15.75 3.09375V1.125C15.75 0.806254 15.858 0.539254 16.074 0.324004C16.29 0.108754 16.557 0.000753879 16.875 3.87931e-06C17.193 -0.000746121 17.4604 0.107254 17.6771 0.324004C17.8939 0.540754 18.0015 0.807754 18 1.125V6.75C18 7.06875 17.892 7.33613 17.676 7.55213C17.46 7.76813 17.193 7.87575 16.875 7.875H11.25C10.9312 7.875 10.6642 7.767 10.449 7.551C10.2337 7.335 10.1257 7.068 10.125 6.75C10.1242 6.432 10.2322 6.165 10.449 5.949C10.6657 5.733 10.9327 5.625 11.25 5.625H14.85C14.25 4.575 13.4299 3.75 12.3896 3.15C11.3494 2.55 10.2195 2.25 8.99999 2.25C7.12499 2.25 5.53125 2.90625 4.21875 4.21875C2.90625 5.53125 2.25 7.125 2.25 9C2.25 10.875 2.90625 12.4688 4.21875 13.7813C5.53125 15.0938 7.12499 15.75 8.99999 15.75C10.275 15.75 11.4424 15.4268 12.5021 14.7803C13.5619 14.1338 14.382 13.2664 14.9625 12.1781C15.1125 11.9156 15.3236 11.733 15.5959 11.6303C15.8681 11.5275 16.1445 11.5226 16.425 11.6156C16.725 11.7094 16.9406 11.9063 17.0719 12.2063C17.2031 12.5063 17.1937 12.7875 17.0437 13.05C16.275 14.55 15.1781 15.75 13.7531 16.65C12.3281 17.55 10.7437 18 8.99999 18Z"
                fill="#444444"
            />
        </svg>
    )
}

function CheckIcon() {
    return (
        <svg width="11.25" height="11.25" viewBox="0 0 24 24" fill="none">
            <path
                d="M5 12L10 17L20 7"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function getPaymentMethodColor(method: string): string {
    switch (method) {
        case "Online":
            return "text-[#0A5445]"
        case "Cash":
            return "text-[#0A5445]"
        case "Failed":
            return "text-[#E21931]"
        case "In Process":
            return "text-[#FE5D27]"
        default:
            return "text-[#444444]"
    }
}

export default function Finance() {
    const navigate = useNavigate()
    const [selectedSlot, setSelectedSlot] = useState(0)
    const selectedDate = "Today, 19 March"

    const totalAmount = 196800
    const onlineAmount = 137760
    const cashAmount = 59040
    const lastSettlement = "₹ 2,40,000 on 18 March"

    const currentSlotData = VENDOR_DATA[`slot${selectedSlot + 1}`] || []
    const hasData = currentSlotData.length > 0
    const hasAnyData = Object.values(VENDOR_DATA).some((slot) => slot.length > 0)

    return (
        <div className="relative mx-auto min-h-screen max-w-103 bg-[#F2F3F6] pb-17">
            {/* Status Bar Spacer */}
            <div className="h-6" />

            {/* Top Bar */}
            <div className="flex items-center justify-between bg-[#F2F3F6] px-5 py-3">
                <h1
                    className="text-[20px] font-bold text-[#000000]"
                    style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                >
                    Finance
                </h1>
                <div className="flex items-center gap-3.5">
                    <button className="p-1" onClick={() => navigate("/search")}>
                        <SearchIcon />
                    </button>
                    <div
                        className="flex h-10.5 w-10.5 items-center justify-center overflow-hidden rounded-full bg-[#CBD5E1]"
                        onClick={() => navigate("/profile")}
                    >
                        <span className="text-[13px] font-bold text-[#334155]">RO</span>
                    </div>
                </div>
            </div>

            {/* Date Selector */}
            <div className="mt-2 px-5">
                <button className="flex items-center gap-3 rounded-[25px] bg-white px-4 py-3">
                    <span
                        className="text-[20px] font-semibold text-[#444444]"
                        style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                    >
                        {selectedDate}
                    </span>
                    <CalendarIcon />
                </button>
            </div>

            {/* Dashboard Card */}
            <div className="mx-5 mt-4 rounded-xl bg-white p-6">
                {/* Total Amount Section */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <p
                            className="mb-1 text-[16px] font-normal text-[#444444]"
                            style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                        >
                            Total Amount
                        </p>
                        <p
                            className="text-[28px] font-bold text-[#0A5445]"
                            style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                        >
                            ₹ {hasAnyData ? totalAmount.toLocaleString("en-IN") : "0"}
                        </p>
                    </div>
                    <button className="p-1">
                        <RefreshIcon />
                    </button>
                </div>

                {/* Divider */}
                <div className="my-4 border-t border-[#F2F3F6]" />

                {/* Online and Cash Breakdown */}
                <div className="mb-4 flex justify-between">
                    <div>
                        <p
                            className="text-[16px] font-normal text-[#444444]"
                            style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                        >
                            Online
                        </p>
                        <p
                            className="mt-1 text-[20px] font-bold text-[#444444]"
                            style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                        >
                            ₹ {hasAnyData ? onlineAmount.toLocaleString("en-IN") : "0"}
                        </p>
                    </div>
                    <div>
                        <p
                            className="text-[16px] font-normal text-[#444444]"
                            style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                        >
                            Cash
                        </p>
                        <p
                            className="mt-1 text-[20px] font-bold text-[#444444]"
                            style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                        >
                            ₹ {hasAnyData ? cashAmount.toLocaleString("en-IN") : "0"}
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="my-4 border-t border-[#F2F3F6]" />

                {/* Last Settlement */}
                <div className="flex items-center justify-between">
                    <p
                        className="text-[14px] font-semibold text-[#444444]"
                        style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                    >
                        Last Settlement: {lastSettlement}
                    </p>
                    <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#59AC77]">
                        <CheckIcon />
                    </div>
                </div>
            </div>

            {/* Slot Tabs - Using the reusable component */}
            <div className="mt-4">
                <SlotTabs tabs={SLOTS} onTabChange={setSelectedSlot} />
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
                                    {/* Avatar */}
                                    <div className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-full bg-[#F2F3F6]">
                                        {vendor.hasAvatar ? (
                                            <span
                                                className="text-[20px] font-bold text-[#444444]"
                                                style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                                            >
                                                {vendor.initials}
                                            </span>
                                        ) : (
                                            <span
                                                className="text-[20px] font-bold text-[#444444]"
                                                style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                                            >
                                                {vendor.initials}
                                            </span>
                                        )}
                                    </div>

                                    {/* Vendor Info */}
                                    <div>
                                        <p
                                            className="text-[18px] font-semibold text-[#444444]"
                                            style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                                        >
                                            {vendor.name}
                                        </p>
                                        <p
                                            className="text-[14px] font-bold text-[#999999]"
                                            style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                                        >
                                            {vendor.time}, {vendor.quantity} Kg
                                        </p>
                                    </div>
                                </div>

                                {/* Amount and Payment Method */}
                                <div className="text-right">
                                    <p
                                        className="text-[20px] font-bold text-[#444444]"
                                        style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                                    >
                                        ₹ {vendor.amount.toLocaleString("en-IN")}
                                    </p>
                                    <p
                                        className={`text-[14px] font-bold ${getPaymentMethodColor(vendor.paymentMethod)}`}
                                        style={{ fontFamily: "'Apercu Pro', sans-serif" }}
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
                                <p
                                    className="mb-2 text-center text-[24px] font-semibold text-[#444444]"
                                    style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                                >
                                    No payments found
                                </p>
                                <p
                                    className="text-center text-[24px] font-semibold text-[#444444]"
                                    style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                                >
                                    in this slot,
                                </p>
                                <p
                                    className="mt-2 text-center text-[24px] font-semibold text-[#444444]"
                                    style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                                >
                                    Check next slot ...
                                </p>
                            </>
                        ) : (
                            <>
                                <p
                                    className="mb-2 text-center text-[24px] font-semibold text-[#444444]"
                                    style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                                >
                                    No payments on
                                </p>
                                <p
                                    className="text-center text-[24px] font-semibold text-[#444444]"
                                    style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                                >
                                    this date ...
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Navbar */}
            <BottomNavbar />
        </div>
    )
}
