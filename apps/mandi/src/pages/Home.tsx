import { useState } from "react"
import { useNavigate } from "react-router-dom"
import StatsBar from "../components/StatsBar"
import SlotTabs from "../components/SlotTabs"
import { VendorList } from "../components/VendorCard"
import BottomNavbar from "../components/BottomNavbar"

interface Vendor {
    id: string
    name: string
    quantity: number
    status: "order-picked" | "cancelled" | "running-late" | "active"
    hasAvatar?: boolean
    totalBill?: number
    pickupTime?: string
    avatarUrl?: string
}

const SLOTS = [
    { id: "slot1", label: "Slot 1", time: "04:00 AM – 04:12 AM" },
    { id: "slot2", label: "Slot 2", time: "05:00 AM – 05:20 AM" },
    { id: "slot3", label: "Slot 3", time: "06:00 AM – 06:30 AM" },
    { id: "slot4", label: "Slot 4", time: "07:00 AM – 07:15 AM" },
    { id: "slot5", label: "Slot 5", time: "08:00 AM – 08:45 AM" },
]

const ALL_VENDORS: Vendor[] = [
    {
        id: "40261",
        name: "Sharma Vegetables",
        quantity: 100,
        status: "order-picked",
        totalBill: 2400,
        pickupTime: "04:00 AM",
    },
    {
        id: "40262",
        name: "Aarya Vegetables",
        quantity: 80,
        status: "cancelled",
        totalBill: 1920,
        pickupTime: "04:00 AM",
    },
    {
        id: "40263",
        name: "Bhati Vegetables",
        quantity: 60,
        status: "running-late",
        totalBill: 1440,
        pickupTime: "04:05 AM",
    },
    {
        id: "40264",
        name: "Bhawani Vegetables",
        quantity: 120,
        status: "running-late",
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

const STATS = { pricePerKg: 24, totalOrders: 82, totalQuantityKg: 8200 }

export default function HomePage() {
    const navigate = useNavigate()
    const [activeSlotIdx, setActiveSlotIdx] = useState(0)
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
    const [paidVendors, setPaidVendors] = useState<Set<string>>(new Set())

    const activeSlot = SLOTS[activeSlotIdx]

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

    const view = selectedVendor && paidVendors.has(selectedVendor.name) ? "pickup" : "collect"

    return (
        <div className="relative mx-auto min-h-screen max-w-[430px] bg-[#F2F3F6] pb-20">
            <div className="h-11" />
            <div className="flex items-center justify-between px-4 py-[4px]">
                <span className="text-xl leading-[26px] font-bold text-[#111111]">
                    ROS Mandi 👋
                </span>
                <div className="flex items-center gap-[14px]">
                    <button
                        className="flex cursor-pointer border-none bg-none p-1"
                        onClick={() => navigate("/search")}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="7" stroke="#222" strokeWidth="2" />
                            <path
                                d="M17 17L21 21"
                                stroke="#222"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                    <div
                        className="flex h-[38px] w-[38px] items-center justify-center overflow-hidden rounded-full bg-[#CBD5E1]"
                        onClick={() => navigate("/profile")}
                    >
                        <span className="text-[13px] font-bold text-[#334155]">RO</span>
                    </div>
                </div>
            </div>

            <StatsBar
                pricePerKg={STATS.pricePerKg}
                totalOrders={STATS.totalOrders}
                totalQuantityKg={STATS.totalQuantityKg}
            />
            <SlotTabs
                tabs={SLOTS.map((s) => ({ label: s.label }))}
                onTabChange={setActiveSlotIdx}
            />

            <div className="flex items-center gap-[10px] px-4 py-3">
                <div className="h-px flex-1 bg-[#D1D5DB]" />
                <span className="rounded-full border border-[#E5E7EB] bg-white px-[14px] py-1 text-[13px] font-medium whitespace-nowrap text-[#444444]">
                    {activeSlot.time}
                </span>
                <div className="h-px flex-1 bg-[#D1D5DB]" />
            </div>

            <div className="px-4">
                <VendorList
                    vendors={ALL_VENDORS}
                    selectedVendorId={selectedVendor?.name ?? null}
                    onSelectVendor={handleSelectVendor}
                    highlightedVendor={selectedVendor}
                    view={view}
                    onCollect={handleCollect}
                />
            </div>
            <BottomNavbar />
        </div>
    )
}
