interface StatsBarProps {
    pricePerKg: number | null
    totalOrders: number
    totalQuantityKg: number
    onPriceClick?: () => void
    isLoading?: boolean
    isError?: boolean
}

export default function StatsBar({
    pricePerKg,
    totalOrders,
    totalQuantityKg,
    onPriceClick,
    isLoading,
    isError,
}: StatsBarProps) {
    const items = [
        {
            label: "Price (Kg)",
            value: pricePerKg != null ? `₹ ${pricePerKg}` : "—",
            onClick: onPriceClick,
        },
        { label: "Total Orders", value: `${totalOrders}` },
        { label: "Total Quantity", value: `${totalQuantityKg} Kg` },
    ]

    if (isLoading) {
        return (
            <div className="mx-4 my-3 flex items-center justify-between rounded-xl bg-white px-5 py-3.5">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                        <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
                        <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
                    </div>
                ))}
            </div>
        )
    }

    if (isError) {
        return (
            <div className="mx-4 my-3 flex items-center justify-center rounded-xl bg-white px-5 py-3.5">
                <span className="text-sm font-medium text-red-500">Failed to load stats</span>
            </div>
        )
    }

    return (
        <div className="mx-4 my-3 flex items-center justify-between rounded-xl bg-white px-5 py-3.5">
            {items.map((item, i) => (
                <div
                    key={i}
                    className={`flex flex-col gap-0.75 transition-all duration-150 ${
                        item.onClick ? "cursor-pointer hover:opacity-80 active:scale-[0.98]" : ""
                    }`}
                    onClick={item.onClick}
                >
                    <span className="text-[12px] leading-4 font-normal text-[#7A7C85]">
                        {item.label}
                    </span>
                    <span className="text-[22px] leading-7 font-bold text-[#111111]">
                        {item.value}
                    </span>
                </div>
            ))}
        </div>
    )
}
