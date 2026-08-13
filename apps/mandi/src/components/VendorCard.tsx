import type { Vendor } from "@/types"
import { Avatar, Button } from "@/components/ui"
import EmptySlot from "./EmptySlot"

interface VendorListProps {
    vendors: Vendor[]
    selectedVendorId?: string | null
    onSelectVendor?: (vendor: Vendor) => void
    highlightedVendor?: Vendor | null
    view?: "collect" | "pickup"
    onCollect?: () => void
    paidVendors?: Set<string>
}

function VendorRow({
    vendor,
    isLast,
    isSelected,
    view,
    onClick,
    onCollect,
}: {
    vendor: Vendor
    isLast: boolean
    isSelected: boolean
    view: "collect" | "pickup"
    onClick?: () => void
    onCollect?: () => void
}) {
    return (
        <div
            className={`${isLast ? "border-b-0" : "border-b border-[#F2F3F6]"} ${isSelected ? "bg-[#FAFAFA]" : "bg-white"}`}
        >
            <div
                onClick={onClick}
                className="flex cursor-pointer items-center justify-between px-4 py-3"
            >
                <div className="flex flex-1 items-center gap-3">
                    <Avatar name={vendor.name} avatarUrl={vendor.avatarUrl} />
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
                        <p
                            className="m-0 mt-0.5"
                            style={{
                                fontFamily: "'Apercu Pro', sans-serif",
                                fontWeight: 700,
                                fontSize: 14,
                                lineHeight: "16px",
                                color: "#999999",
                            }}
                        >
                            ID: {vendor.id}
                        </p>
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

            {isSelected && (
                <div className="px-4 pb-4">
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
                            ₹ {vendor.totalBill}
                        </span>
                    </div>

                    {view === "collect" ? (
                        <Button
                            onClick={(e) => {
                                e.stopPropagation()
                                onCollect?.()
                            }}
                        >
                            Collect Payment
                        </Button>
                    ) : (
                        <Button variant="status">Pickup at {vendor.pickupTime}</Button>
                    )}
                </div>
            )}
        </div>
    )
}

export function VendorList({
    vendors,
    selectedVendorId: _selectedVendorId,
    onSelectVendor,
    highlightedVendor,
    view: _view,
    onCollect,
    paidVendors = new Set(),
}: VendorListProps) {
    const isBefore4AM = new Date().getHours() < 4

    if (!vendors || vendors.length === 0) {
        return <EmptySlot />
    }

    return (
        <div className="overflow-hidden rounded-lg bg-white">
            {vendors.map((vendor, index) => {
                const isRowPickedUp =
                    vendor.status === "order-picked" || paidVendors.has(vendor.name)
                const rowView = isBefore4AM || isRowPickedUp ? "pickup" : "collect"
                return (
                    <VendorRow
                        key={vendor.id}
                        vendor={vendor}
                        isLast={index === vendors.length - 1}
                        isSelected={highlightedVendor?.name === vendor.name}
                        view={rowView}
                        onClick={() => onSelectVendor?.(vendor)}
                        onCollect={onCollect}
                    />
                )
            })}
        </div>
    )
}

export default function VendorCard({ vendor }: { vendor: Vendor }) {
    return <VendorRow vendor={vendor} isLast={false} isSelected={false} view="collect" />
}
