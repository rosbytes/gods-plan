export function EmptySlot() {
    return (
        <div className="flex min-h-75 flex-col items-center justify-center px-4 py-16 text-center">
            <p className="font-apercu text-[24px] leading-8.5 font-semibold text-[#444444]">
                No orders found <br />
                in this slot,
            </p>
            <p className="font-apercu mt-8 text-[22px] font-bold text-[#666666]">
                Check next slot ...
            </p>
        </div>
    )
}

export default EmptySlot
