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

interface VendorListProps {
    vendors: Vendor[]
    selectedVendorId?: string | null
    onSelectVendor?: (vendor: Vendor) => void
    highlightedVendor?: Vendor | null
    view?: "collect" | "pickup"
    onCollect?: () => void
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
    const initials = name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={name}
                className="h-11 w-11 shrink-0 rounded-full object-cover"
            />
        )
    }

    return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F2F3F6]">
            <span
                style={{
                    fontFamily: "'Apercu Pro', sans-serif",
                    fontWeight: 700,
                    fontSize: 20,
                    lineHeight: "24px",
                    color: "#444444",
                }}
            >
                {initials}
            </span>
        </div>
    )
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
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onCollect?.()
                            }}
                            className="flex w-full cursor-pointer items-center justify-center rounded-xl border-none bg-[#0A5445] text-white"
                            style={{
                                height: 48,
                                fontFamily: "'Apercu Pro', sans-serif",
                                fontWeight: 700,
                                fontSize: 20,
                                lineHeight: "24px",
                            }}
                        >
                            Collect Payment
                        </button>
                    ) : (
                        <div
                            className="flex w-full items-center justify-center rounded-xl bg-[#DAE6E3] text-center"
                            style={{
                                height: 48,
                                fontFamily: "'Apercu Pro', sans-serif",
                                fontWeight: 700,
                                fontSize: 20,
                                lineHeight: "24px",
                                color: "#0A5445",
                            }}
                        >
                            Pickup at {vendor.pickupTime}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export function VendorList({
    vendors,
    selectedVendorId,
    onSelectVendor,
    highlightedVendor,
    view = "collect",
    onCollect,
}: VendorListProps) {
    return (
        <div className="overflow-hidden rounded-lg bg-white">
            {vendors.map((vendor, index) => (
                <VendorRow
                    key={vendor.id}
                    vendor={vendor}
                    isLast={index === vendors.length - 1}
                    isSelected={highlightedVendor?.name === vendor.name}
                    view={view}
                    onClick={() => onSelectVendor?.(vendor)}
                    onCollect={onCollect}
                />
            ))}
        </div>
    )
}

export default function VendorCard({ vendor }: { vendor: Vendor }) {
    return <VendorRow vendor={vendor} isLast={false} isSelected={false} view="collect" />
}
