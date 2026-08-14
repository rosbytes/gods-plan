import { useState, useDeferredValue } from "react"
import { useNavigate } from "react-router-dom"
import { VendorList } from "@/components/VendorCard"
import { BackArrowIcon } from "@/components/icons"
import { trpc } from "@/libs/trpc"
import type { Vendor } from "@/types"

export default function Search() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

    // Defer query to avoid firing on every keystroke
    const deferredQuery = useDeferredValue(searchQuery.trim())
    const shouldSearch = deferredQuery.length > 0

    const {
        data: results = [],
        isLoading,
        isError,
    } = trpc.vendor.searchOrders.useQuery(
        { query: deferredQuery },
        { enabled: shouldSearch, refetchOnWindowFocus: false },
    )

    const vendors = results as Vendor[]

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
                            placeholder="Search by vendor name or order ID..."
                            className="font-apercu flex-1 border-none bg-transparent text-[16px] font-semibold text-[#444444] outline-none placeholder:text-[#999999]"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery("")
                                    setSelectedVendor(null)
                                }}
                                className="ml-2 cursor-pointer border-none bg-transparent text-xl leading-none text-[#999999]"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="mt-4 px-5">
                {!shouldSearch ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <p className="font-apercu text-center text-[24px] leading-7 font-semibold text-[#444444]">
                            Search by vendor name
                            <br />
                            or order ID
                        </p>
                    </div>
                ) : isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0B4E3E]" />
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <p className="font-apercu text-center text-[20px] font-semibold text-red-500">
                            Failed to search orders
                        </p>
                    </div>
                ) : vendors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <p className="font-apercu text-center text-[24px] font-semibold text-[#444444]">
                            No results found...
                        </p>
                    </div>
                ) : (
                    <VendorList
                        vendors={vendors}
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
