interface StatsBarProps {
    pricePerKg: number
    totalOrders: number
    totalQuantityKg: number
}

export default function StatsBar({ pricePerKg, totalOrders, totalQuantityKg }: StatsBarProps) {
    const items = [
        { label: "Price (Kg)", value: `₹ ${pricePerKg}` },
        { label: "Total Orders", value: `${totalOrders}` },
        { label: "Total Quantity", value: `${totalQuantityKg} Kg` },
    ]

    return (
        <div className="mx-4 my-3 flex items-center justify-between rounded-[12px] bg-white px-5 py-[14px]">
            {items.map((item, i) => (
                <div key={i} className="flex flex-col gap-[3px]">
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
