// src/pages/Search.tsx
import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import SlotTabs from "@/components/SlotTabs"
import { VendorList } from "@/components/VendorCard"

// Reuse the exact Vendor interface from VendorCard
interface Vendor {
    id: string
    name: string
    quantity: number
    status: "order-picked" | "cancelled" | "running-late" | "active"
    totalBill?: number
    pickupTime?: string
    avatarUrl?: string
}

const SLOTS = [
    { id: "slot1", label: "Slot 1" },
    { id: "slot2", label: "Slot 2" },
    { id: "slot3", label: "Slot 3" },
    { id: "slot4", label: "Slot 4" },
    { id: "slot5", label: "Slot 5" },
]

// Mock data matching your PDF design
const MOCK_SEARCH_DATA: Vendor[] = [
    {
        id: "40261",
        name: "Sharma Vegetables",
        quantity: 100,
        status: "running-late",
        pickupTime: "04:01 AM",
    },
    {
        id: "40260",
        name: "Sharma Vegetables",
        quantity: 100,
        status: "order-picked",
        totalBill: 2400,
        pickupTime: "04:07 AM",
    },
    {
        id: "40259",
        name: "Sharma Vegetables",
        quantity: 100,
        status: "order-picked",
        totalBill: 2400,
        pickupTime: "04:07 AM",
    },
    {
        id: "40258",
        name: "Sharma Vegetables",
        quantity: 100,
        status: "order-picked",
        totalBill: 2400,
        pickupTime: "04:07 AM",
    },
    { id: "40257", name: "Sharma Vegetables", quantity: 100, status: "cancelled" },
    {
        id: "40256",
        name: "Sharma Vegetables",
        quantity: 100,
        status: "order-picked",
        totalBill: 2400,
        pickupTime: "04:07 AM",
    },
    {
        id: "40255",
        name: "Sharma Vegetables",
        quantity: 100,
        status: "order-picked",
        totalBill: 2400,
        pickupTime: "04:07 AM",
    },
    {
        id: "40254",
        name: "Sharma Vegetables",
        quantity: 100,
        status: "order-picked",
        totalBill: 2400,
        pickupTime: "04:07 AM",
    },
    { id: "40253", name: "Sharma Vegetables", quantity: 100, status: "cancelled" },
    {
        id: "40252",
        name: "Sharma Vegetables",
        quantity: 100,
        status: "order-picked",
        totalBill: 2400,
        pickupTime: "04:07 AM",
    },
]

function BackArrowIcon() {
    return (
        <svg
            width="23"
            height="21"
            viewBox="0 0 23 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M9.62579 20.3725C9.81684 20.5528 10.0698 20.653 10.3325 20.6525C10.5942 20.6547 10.8452 20.5485 11.0258 20.3591C11.2164 20.1734 11.3239 19.9186 11.3239 19.6525C11.3239 19.3863 11.2164 19.1315 11.0258 18.9458L3.4257 11.3457H21.0527C21.605 11.3457 22.0527 10.898 22.0527 10.3457C22.0527 9.79342 21.605 9.3457 21.0527 9.3457H3.42278L11.0391 1.70579C11.2297 1.52007 11.3372 1.26524 11.3372 0.99912C11.3372 0.733003 11.2297 0.47817 11.0391 0.292453C10.6487 -0.0974845 10.0162 -0.0974845 9.62579 0.292453L0.292453 9.62579C-0.0974845 10.0162 -0.0974845 10.6487 0.292453 11.0391L9.62579 20.3725Z"
                fill="black"
            />
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

export default function Search() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSlot, setSelectedSlot] = useState(0)
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

    // Filter vendors based on search query (Name or ID)
    const filteredVendors = useMemo(() => {
        if (!searchQuery.trim()) return []
        const query = searchQuery.toLowerCase()
        return MOCK_SEARCH_DATA.filter(
            (v) => v.name.toLowerCase().includes(query) || v.id.includes(query),
        )
    }, [searchQuery])

    const handleSelectVendor = (vendor: Vendor) => {
        setSelectedVendor(selectedVendor?.id === vendor.id ? null : vendor)
    }

    // Determine view type for VendorCard
    const view = selectedVendor?.status === "order-picked" ? "pickup" : "collect"

    return (
        <div className="relative mx-auto min-h-screen max-w-103 bg-[#F2F3F6] pb-10">
            {/* Status Bar Spacer */}
            <div className="h-6" />

            {/* Top Bar with Search Input */}
            <div className="flex items-center gap-3 bg-[#F2F3F6] px-5 py-3">
                <button onClick={() => navigate(-1)} className="shrink-0 p-1">
                    <BackArrowIcon />
                </button>

                <div className="relative flex-1">
                    <div className="flex h-12 items-center rounded-[25px] bg-white px-4 shadow-sm">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or order ID..."
                            className="flex-1 border-none bg-transparent text-[16px] font-semibold text-[#444444] outline-none placeholder:text-[#999999]"
                            style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="ml-2 text-xl leading-none text-[#999999]"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters: Date & Slots */}
            {searchQuery.trim().length > 0 && (
                <>
                    {/* Date Selector */}
                    <div className="mt-2 px-5">
                        <button className="flex items-center gap-3 rounded-[25px] bg-white px-4 py-3 shadow-sm">
                            <span
                                className="text-[20px] font-semibold text-[#444444]"
                                style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                            >
                                18 March, 2026
                            </span>
                            <CalendarIcon />
                        </button>
                    </div>

                    {/* Slot Tabs - Reusing existing component */}
                    <SlotTabs tabs={SLOTS} onTabChange={setSelectedSlot} />
                </>
            )}

            {/* Content Area */}
            <div className="mt-4 px-5">
                {!searchQuery.trim() ? (
                    /* Initial Empty State */
                    <div className="flex flex-col items-center justify-center py-20">
                        <p
                            className="text-center text-[24px] leading-7 font-semibold text-[#444444]"
                            style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                        >
                            Search by vendor name
                            <br />
                            or order ID
                        </p>
                    </div>
                ) : filteredVendors.length === 0 ? (
                    /* No Results Found */
                    <div className="flex flex-col items-center justify-center py-20">
                        <p
                            className="text-center text-[24px] font-semibold text-[#444444]"
                            style={{ fontFamily: "'Apercu Pro', sans-serif" }}
                        >
                            No results found...
                        </p>
                    </div>
                ) : (
                    /* Results List - Reusing VendorList component */
                    <VendorList
                        vendors={filteredVendors}
                        selectedVendorId={selectedVendor?.id ?? null}
                        onSelectVendor={handleSelectVendor}
                        highlightedVendor={selectedVendor}
                        view={view}
                        onCollect={() => {}} // No action needed in search view
                    />
                )}
            </div>
        </div>
    )
}
