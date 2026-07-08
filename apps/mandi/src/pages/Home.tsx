import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "@/components/layouts/AppLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatsBar from "@/components/StatsBar"
import SlotTabs from "@/components/SlotTabs"
import { VendorList } from "@/components/VendorCard"
import { SLOTS } from "@/data/slots"
import { HOME_VENDORS, HOME_STATS } from "@/data/vendors"
import type { Vendor } from "@/types"

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
        <AppLayout>
            <PageHeader title="ROS Mandi 👋" />

            <StatsBar
                pricePerKg={HOME_STATS.pricePerKg}
                totalOrders={HOME_STATS.totalOrders}
                totalQuantityKg={HOME_STATS.totalQuantityKg}
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
                    vendors={HOME_VENDORS}
                    selectedVendorId={selectedVendor?.name ?? null}
                    onSelectVendor={handleSelectVendor}
                    highlightedVendor={selectedVendor}
                    view={view}
                    onCollect={handleCollect}
                />
            </div>
        </AppLayout>
    )
}
