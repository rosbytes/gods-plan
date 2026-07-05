import { useState } from "react"
import { useNavigate } from "react-router-dom"
import BottomNavbar from "@/components/BottomNavbar"
import SlotTabs from "@/components/SlotTabs"
import StatsBar from "@/components/StatsBar"

type VendorStatus = "order-picked" | "cancelled" | "running-late"
type PayMethod = "cash" | "online"

interface Vendor {
    id: string
    name: string
    quantity: number
    status: VendorStatus
    totalBill: number
    pickupTime: string
}

const SLOTS = [
    { id: "slot1", label: "Slot 1", time: "04:00 AM – 04:12 AM" },
    { id: "slot2", label: "Slot 2", time: "05:00 AM – 05:20 AM" },
    { id: "slot3", label: "Slot 3", time: "06:00 AM – 06:30 AM" },
    { id: "slot4", label: "Slot 4", time: "07:00 AM – 07:15 AM" },
    { id: "slot5", label: "Slot 5", time: "08:00 AM – 08:45 AM" },
]

const VENDORS: Vendor[] = [
    {
        id: "40261",
        name: "Sharma Vegetables",
        quantity: 100,
        status: "cancelled",
        totalBill: 2400,
        pickupTime: "04:00 AM",
    },
    {
        id: "40262",
        name: "Aarya Vegetables",
        quantity: 80,
        status: "order-picked",
        totalBill: 1920,
        pickupTime: "04:07 AM",
    },
    {
        id: "40263",
        name: "Bhati Vegetables",
        quantity: 60,
        status: "order-picked",
        totalBill: 1440,
        pickupTime: "04:05 AM",
    },
    {
        id: "40264",
        name: "Bhawani Vegetables",
        quantity: 120,
        status: "cancelled",
        totalBill: 2880,
        pickupTime: "04:10 AM",
    },
    {
        id: "40265",
        name: "Sid Vegetables",
        quantity: 140,
        status: "order-picked",
        totalBill: 3360,
        pickupTime: "04:08 AM",
    },
    {
        id: "40266",
        name: "Rehman Vegetables",
        quantity: 100,
        status: "order-picked",
        totalBill: 2400,
        pickupTime: "04:06 AM",
    },
    {
        id: "40267",
        name: "Hamza Vegetables",
        quantity: 80,
        status: "order-picked",
        totalBill: 1920,
        pickupTime: "04:04 AM",
    },
    {
        id: "40268",
        name: "Maanvi Vegetables",
        quantity: 60,
        status: "order-picked",
        totalBill: 1440,
        pickupTime: "04:02 AM",
    },
    {
        id: "40269",
        name: "Mishra Vegetables",
        quantity: 140,
        status: "order-picked",
        totalBill: 3360,
        pickupTime: "04:09 AM",
    },
    {
        id: "40270",
        name: "Noor Vegetables",
        quantity: 120,
        status: "order-picked",
        totalBill: 2880,
        pickupTime: "04:11 AM",
    },
]

function buildInitialPaid(): Map<string, PayMethod> {
    const map = new Map<string, PayMethod>()
    VENDORS.forEach((v, i) => map.set(v.id, i % 2 === 0 ? "cash" : "online"))
    return map
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
}

function getStatusStyle(status: VendorStatus): { label: string; cls: string } {
    if (status === "cancelled") return { label: "Cancelled", cls: "text-[#E21931]" }
    if (status === "running-late") return { label: "Running Late", cls: "text-[#F97316]" }
    return { label: "Order Picked", cls: "text-[#0A5445]" }
}

function SearchIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#444444" strokeWidth="2" />
            <path d="M17 17L21 21" stroke="#444444" strokeWidth="2" strokeLinecap="round" />
        </svg>
    )
}

function CalendarIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="#444444" strokeWidth="1.8" />
            <path d="M3 9H21" stroke="#444444" strokeWidth="1.8" />
            <path d="M8 2V6M16 2V6" stroke="#444444" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    )
}

export default function OrdersPage() {
    const navigate = useNavigate()
    const [activeSlotIdx, setActiveSlotIdx] = useState<number>(0)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [paid] = useState<Map<string, PayMethod>>(buildInitialPaid)

    const toggleExpand = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

    return (
        <div className="relative mx-auto min-h-screen max-w-103 bg-[#F2F3F6] pb-17">
            <div className="h-10" />
            <div className="flex h-12 w-full items-center justify-between bg-[#F2F3F6] px-5">
                <span
                    style={{
                        fontFamily: "'Apercu Pro', sans-serif",
                        fontWeight: 700,
                        fontSize: 20,
                        lineHeight: "24px",
                        color: "#000000",
                    }}
                >
                    All Orders
                </span>
                <div className="flex items-center gap-3.5">
                    <button
                        type="button"
                        className="flex items-center justify-center p-0"
                        onClick={() => navigate("/search")}
                    >
                        <SearchIcon />
                    </button>
                    <div
                        className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-full bg-[#CBD5E1]"
                        onClick={() => navigate("/profile")}
                    >
                        <span
                            style={{
                                fontFamily: "'Apercu Pro', sans-serif",
                                fontWeight: 700,
                                fontSize: 13,
                                color: "#334155",
                            }}
                        >
                            RO
                        </span>
                    </div>
                </div>
            </div>

            <div className="px-5 pt-1 pb-2">
                <button
                    type="button"
                    className="flex items-center gap-3 rounded-[25px] bg-white px-4 py-3"
                >
                    <span
                        style={{
                            fontFamily: "'Apercu Pro', sans-serif",
                            fontWeight: 600,
                            fontSize: 20,
                            lineHeight: "24px",
                            color: "#444444",
                        }}
                    >
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
                    {VENDORS.map((vendor, idx) => {
                        const isExpanded = expandedId === vendor.id
                        const payMethod = paid.get(vendor.id)
                        const { label, cls } = getStatusStyle(vendor.status)

                        return (
                            <div
                                key={vendor.id}
                                className={
                                    idx < VENDORS.length - 1 ? "border-b border-[#F2F3F6]" : ""
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
                                            <span
                                                style={{
                                                    fontFamily: "'Apercu Pro', sans-serif",
                                                    fontWeight: 700,
                                                    fontSize: 20,
                                                    lineHeight: "24px",
                                                    color: "#444444",
                                                }}
                                            >
                                                {getInitials(vendor.name)}
                                            </span>
                                        </div>
                                        <div>
                                            <p
                                                className="m-0"
                                                style={{
                                                    fontFamily: "'Apercu Pro', sans-serif",
                                                    fontWeight: 600,
                                                    fontSize: 18,
                                                    lineHeight: "22px",
                                                    color: "#444444",
                                                }}
                                            >
                                                {vendor.name}
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-2">
                                                <span
                                                    style={{
                                                        fontFamily: "'Apercu Pro', sans-serif",
                                                        fontWeight: 700,
                                                        fontSize: 14,
                                                        lineHeight: "16px",
                                                        color: "#999999",
                                                    }}
                                                >
                                                    ID: {vendor.id}
                                                </span>
                                                <span
                                                    className={cls}
                                                    style={{
                                                        fontFamily: "'Apercu Pro', sans-serif",
                                                        fontWeight: 700,
                                                        fontSize: 14,
                                                        lineHeight: "16px",
                                                    }}
                                                >
                                                    {label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span
                                        style={{
                                            fontFamily: "'Apercu Pro', sans-serif",
                                            fontWeight: 700,
                                            fontSize: 20,
                                            lineHeight: "24px",
                                            color: "#444444",
                                        }}
                                    >
                                        {vendor.quantity} Kg
                                    </span>
                                </div>

                                {isExpanded && (
                                    <div className="px-6 pb-4">
                                        <div className="mb-3 flex items-center justify-between border-t border-[#F0F0F0] py-3">
                                            <span
                                                style={{
                                                    fontFamily: "'Apercu Pro', sans-serif",
                                                    fontWeight: 600,
                                                    fontSize: 18,
                                                    lineHeight: "22px",
                                                    color: "#444444",
                                                }}
                                            >
                                                Total Bill:
                                            </span>
                                            <span
                                                style={{
                                                    fontFamily: "'Apercu Pro', sans-serif",
                                                    fontWeight: 700,
                                                    fontSize: 18,
                                                    lineHeight: "22px",
                                                    color: "#000000",
                                                }}
                                            >
                                                ₹ {vendor.totalBill.toLocaleString()}
                                            </span>
                                        </div>
                                        <div
                                            className="flex w-full items-center justify-center rounded-xl"
                                            style={{ backgroundColor: "#DAE6E3", height: 48 }}
                                        >
                                            <span
                                                style={{
                                                    fontFamily: "'Apercu Pro', sans-serif",
                                                    fontWeight: 700,
                                                    fontSize: 20,
                                                    lineHeight: "24px",
                                                    color: "#0A5445",
                                                }}
                                            >
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
            <BottomNavbar />
        </div>
    )
}
