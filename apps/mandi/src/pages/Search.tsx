import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import SlotTabs from "@/components/SlotTabs"
import { VendorList } from "@/components/VendorCard"
import { BackArrowIcon, CalendarIcon } from "@/components/icons"
import { SLOTS } from "@/data/slots"
import { SEARCH_VENDORS } from "@/data/vendors"
import type { Vendor } from "@/types"

export default function Search() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState("")
    const [_selectedSlot, setSelectedSlot] = useState(0)
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

    const filteredVendors = useMemo(() => {
        if (!searchQuery.trim()) return []
        const query = searchQuery.toLowerCase()
        return SEARCH_VENDORS.filter(
            (v) => v.name.toLowerCase().includes(query) || v.id.includes(query),
        )
    }, [searchQuery])

    const handleSelectVendor = (vendor: Vendor) => {
        setSelectedVendor(selectedVendor?.id === vendor.id ? null : vendor)
    }

    const view = selectedVendor?.status === "order-picked" ? "pickup" : "collect"

    return (
        <div className="relative mx-auto min-h-screen max-w-103 bg-[#F2F3F6] pb-10">
            <div className="h-6" />

            {/* Top Bar with Search Input */}
            <div className="flex items-center gap-3 bg-[#F2F3F6] px-5 py-3">
                <button
                    onClick={() => navigate(-1)}
                    className="shrink-0 cursor-pointer border-none bg-transparent p-1"
                >
                    <BackArrowIcon />
                </button>
                <div className="relative flex-1">
                    <div className="flex h-12 items-center rounded-[25px] bg-white px-4 shadow-sm">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or order ID..."
                            className="font-apercu flex-1 border-none bg-transparent text-[16px] font-semibold text-[#444444] outline-none placeholder:text-[#999999]"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="ml-2 cursor-pointer border-none bg-transparent text-xl leading-none text-[#999999]"
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
                    <div className="mt-2 px-5">
                        <button className="flex items-center gap-3 rounded-[25px] bg-white px-4 py-3 shadow-sm">
                            <span className="font-apercu text-[20px] font-semibold text-[#444444]">
                                18 March, 2026
                            </span>
                            <CalendarIcon />
                        </button>
                    </div>
                    <SlotTabs tabs={SLOTS} onTabChange={setSelectedSlot} />
                </>
            )}

            {/* Content Area */}
            <div className="mt-4 px-5">
                {!searchQuery.trim() ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <p className="font-apercu text-center text-[24px] leading-7 font-semibold text-[#444444]">
                            Search by vendor name
                            <br />
                            or order ID
                        </p>
                    </div>
                ) : filteredVendors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <p className="font-apercu text-center text-[24px] font-semibold text-[#444444]">
                            No results found...
                        </p>
                    </div>
                ) : (
                    <VendorList
                        vendors={filteredVendors}
                        selectedVendorId={selectedVendor?.id ?? null}
                        onSelectVendor={handleSelectVendor}
                        highlightedVendor={selectedVendor}
                        view={view}
                        onCollect={() => {}}
                    />
                )}
            </div>
        </div>
    )
}
