interface StatsBarProps {
    pricePerKg: number
    totalOrders: number
    totalQuantityKg: number
    onPriceClick?: () => void
}

export default function StatsBar({
    pricePerKg,
    totalOrders,
    totalQuantityKg,
    onPriceClick,
}: StatsBarProps) {
    const items = [
        { label: "Price (Kg)", value: `₹ ${pricePerKg}`, onClick: onPriceClick },
        { label: "Total Orders", value: `${totalOrders}` },
        { label: "Total Quantity", value: `${totalQuantityKg} Kg` },
    ]

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
