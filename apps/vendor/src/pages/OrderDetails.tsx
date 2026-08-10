import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Icon } from "@iconify/react"
import { trpc } from "../lib/trpc"
import { toast } from "sonner"

export default function OrderDetails() {
    const navigate = useNavigate()
    const { orderId } = useParams<{ orderId: string }>()
    const [isExpanded, setIsExpanded] = useState(false)
    const [downloading, setDownloading] = useState(false)

    // Fetch order details
    const {
        data: order,
        isLoading,
        isError,
        refetch,
    } = trpc.order.getOrderDetails.useQuery({ orderId: orderId || "" }, { enabled: !!orderId })

    // Help center toast
    const handleHelpClick = () => {
        toast.info("ROS counter support has been notified. We will contact you shortly.")
    }

    // Download invoice mock
    const handleDownloadInvoice = () => {
        if (downloading) return
        setDownloading(true)
        toast.info("Downloading invoice...")
        setTimeout(() => {
            toast.success("Invoice downloaded successfully!")
            setDownloading(false)
        }, 1500)
    }

    if (isLoading) {
        return (
            <div className="relative flex min-h-screen items-center justify-center bg-[#F8F9FA]">
                <Icon icon="mdi:loading" className="h-8 w-8 animate-spin text-[#0B4E3E]" />
            </div>
        )
    }

    if (isError || !order) {
        return (
            <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#F8F9FA] px-6 text-center">
                <Icon icon="mdi:alert-circle-outline" className="mb-2 h-16 w-16 text-red-500" />
                <h2 className="text-lg font-bold text-gray-800">Failed to load order details</h2>
                <button
                    onClick={() => refetch()}
                    className="mt-4 rounded-full bg-[#0B4E3E] px-6 py-2.5 font-bold text-white shadow-sm transition-transform active:scale-95"
                >
                    Try Again
                </button>
            </div>
        )
    }

    // Get style details based on status label
    const getStatusStyle = (
        status: "Pickup Pending" | "Completed" | "Cancelled" | "Pickup Failed",
    ) => {
        switch (status) {
            case "Completed":
                return {
                    bg: "bg-[#E6F3F0]",
                    text: "text-[#0B4E3E]",
                }
            case "Cancelled":
                return {
                    bg: "bg-[#FDF2F2]",
                    text: "text-[#E02424]",
                }
            case "Pickup Failed":
                return {
                    bg: "bg-[#FFF5F5]",
                    text: "text-[#E02424]",
                }
            default: // Pickup Pending
                return {
                    bg: "bg-[#FFF0EB]",
                    text: "text-[#FF5A1F]",
                }
        }
    }

    const badgeStyle = getStatusStyle(order.statusLabel)

    // Items list to display based on expand state
    const visibleItems = isExpanded ? order.items : order.items.slice(0, 3)

    return (
        <div className="relative min-h-screen bg-[#F8F9FA] pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between bg-[#F8F9FA] px-6 py-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200/50 transition-transform active:scale-90"
                >
                    <Icon icon="mdi:arrow-left" className="h-6 w-6 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
                <button
                    onClick={handleHelpClick}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors active:bg-gray-50"
                >
                    <Icon icon="mdi:headphones" className="h-4 w-4 text-gray-500" />
                    Help
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex flex-col gap-4 px-4 pb-4">
                {/* Order Info Card */}
                <div className="flex w-full flex-col rounded-3xl bg-white p-5 shadow-xs ring-1 ring-gray-100/70">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-black text-gray-900">#{order.orderCode}</h2>
                            <span className="mt-1 text-sm font-bold text-gray-400">
                                {order.placedAt}
                            </span>
                        </div>
                        <span
                            className={`text-2xs rounded-full px-3.5 py-1.5 font-extrabold tracking-wide ${badgeStyle.bg} ${badgeStyle.text}`}
                        >
                            {order.statusLabel}
                        </span>
                    </div>

                    <div className="my-4 border-t border-gray-100" />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-400">
                                {order.statusLabel === "Cancelled" ? "Cancelled By" : "Pickup Time"}
                            </span>
                            <span className="mt-1 text-base font-black text-gray-800">
                                {order.statusLabel === "Cancelled"
                                    ? order.cancelledBy
                                    : order.pickupTime}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-400">Payment Mode</span>
                            <span
                                className={`mt-1 block truncate text-base font-black ${
                                    order.paymentMethod === "Not Paid"
                                        ? "text-gray-800"
                                        : "text-[#0B4E3E]"
                                }`}
                                title={order.paymentMethod}
                            >
                                {order.paymentMethod}
                            </span>
                        </div>
                    </div>

                    {order.statusLabel === "Pickup Pending" && (
                        <>
                            <div className="mt-4 border-t border-gray-100" />
                            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
                                <Icon
                                    icon="mdi:alert-circle-outline"
                                    className="mt-0.5 h-5 w-5 shrink-0 text-gray-400"
                                />
                                <p className="flex-1 text-xs leading-relaxed font-semibold text-gray-500">
                                    Your pickup details will appear automatically in the{" "}
                                    <span
                                        onClick={() => navigate("/pickup")}
                                        className="cursor-pointer font-bold text-[#0B4E3E] underline"
                                    >
                                        Pickup tab
                                    </span>{" "}
                                    when collection starts at 04:00 AM.
                                </p>
                            </div>
                        </>
                    )}

                    {order.statusLabel === "Pickup Failed" && (
                        <>
                            <div className="mt-4 border-t border-gray-100" />
                            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
                                <Icon
                                    icon="mdi:alert-circle-outline"
                                    className="mt-0.5 h-5 w-5 shrink-0 text-gray-400"
                                />
                                <p className="flex-1 text-xs leading-relaxed font-semibold text-gray-500">
                                    This order wasn't picked up during the scheduled time. Our
                                    support team can help if you need assistance.
                                </p>
                            </div>
                        </>
                    )}

                    {order.statusLabel === "Cancelled" && (
                        <>
                            <div className="mt-4 border-t border-gray-100" />
                            <div className="mt-4 flex flex-col gap-1 rounded-2xl bg-gray-50 p-4">
                                <div className="flex items-center gap-2">
                                    <Icon
                                        icon="mdi:alert-circle-outline"
                                        className="h-5 w-5 shrink-0 text-gray-400"
                                    />
                                    <span className="text-xs font-black text-gray-800">
                                        Cancellation Reason
                                    </span>
                                </div>
                                <p className="pl-7 text-xs leading-relaxed font-semibold text-gray-500 italic">
                                    &ldquo;{order.cancellationReason}&rdquo;
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* All Items Card */}
                <div className="flex w-full flex-col rounded-3xl bg-white p-5 shadow-xs ring-1 ring-gray-100/70">
                    <h3 className="mb-4 text-sm font-bold text-gray-500">All Items</h3>

                    <div className="flex flex-col gap-4 divide-y divide-gray-100">
                        {visibleItems.map((item, idx) => {
                            const imageSrc =
                                item.veg.vegPrimaryImage || "https://placehold.co/100x100?text=Veg"
                            const priceUpdated = item.actualPrice !== item.estimatedPrice
                            const diffAmount = item.diffAmount

                            return (
                                <div
                                    key={item.id}
                                    className={`flex flex-col ${idx > 0 ? "pt-4" : ""}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={imageSrc}
                                            alt={item.veg.name}
                                            className="h-14 w-14 rounded-xl object-cover ring-1 ring-gray-100"
                                        />
                                        <div className="flex flex-1 flex-col">
                                            <h4 className="text-base leading-tight font-black text-gray-800">
                                                {item.veg.name}/ {item.veg.nameInHindi}
                                            </h4>
                                            <span className="mt-1 text-xs font-semibold text-gray-400">
                                                ₹{item.actualPrice}/Kg
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-black text-gray-800">
                                                {item.quantityKg} Kg
                                            </span>
                                            <span className="mt-0.5 text-sm font-black text-gray-900">
                                                ₹{item.subtotal.toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Price Updates */}
                                    {priceUpdated && (
                                        <div className="mt-2.5 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-xs">
                                            <span className="font-semibold text-gray-500">
                                                Price Updated: ₹{item.estimatedPrice} &rarr; ₹
                                                {item.actualPrice}
                                            </span>
                                            <span
                                                className={`font-black ${
                                                    diffAmount > 0
                                                        ? "text-[#E02424]"
                                                        : "text-[#0B4E3E]"
                                                }`}
                                            >
                                                {diffAmount > 0 ? "+" : "-"}₹
                                                {Math.abs(diffAmount).toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {order.items.length > 3 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-gray-50 py-3 text-sm font-black text-gray-800 transition-colors hover:bg-gray-100 active:scale-[0.98]"
                        >
                            {isExpanded ? "View Less" : "View All"}
                            <Icon
                                icon={isExpanded ? "mdi:chevron-up" : "mdi:chevron-down"}
                                className="h-5 w-5 text-gray-500"
                            />
                        </button>
                    )}
                </div>

                {/* Bill Details */}
                <div className="flex w-full flex-col rounded-3xl bg-white p-5 shadow-xs ring-1 ring-gray-100/70">
                    <h3 className="mb-4 text-sm font-bold text-gray-500">Bill Details</h3>

                    <div className="flex flex-col gap-3.5 border-b border-gray-100 pb-4">
                        <div className="flex items-center justify-between text-base font-medium">
                            <span className="text-gray-500">Total Items</span>
                            <span className="text-gray-900">{order.totalItems}</span>
                        </div>
                        <div className="flex items-center justify-between text-base font-medium">
                            <span className="text-gray-500">Total Quantity</span>
                            <span className="font-bold text-gray-900">{order.totalWeight} Kg</span>
                        </div>
                        <div className="flex items-center justify-between text-base font-medium">
                            <span className="text-gray-500">Est. Total</span>
                            <span className="font-bold text-gray-900">
                                ₹{order.estimatedTotal.toLocaleString("en-IN")}
                            </span>
                        </div>
                        {order.walletAdjustment !== 0 && (
                            <div className="flex items-center justify-between text-base font-medium">
                                <span className="border-b border-dashed border-gray-300 text-gray-500">
                                    Wallet Adjustment
                                </span>
                                <span
                                    className={`font-black ${
                                        order.walletAdjustment < 0
                                            ? "text-[#0B4E3E]"
                                            : "text-[#E02424]"
                                    }`}
                                >
                                    {order.walletAdjustment < 0 ? "-" : "+"} ₹
                                    {Math.abs(order.walletAdjustment).toLocaleString("en-IN")}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <span className="text-base font-black text-gray-900">Amount to Pay</span>
                        <span className="text-lg font-black text-[#0B4E3E]">
                            ₹{order.amountToPay.toLocaleString("en-IN")}
                        </span>
                    </div>
                </div>

                {/* Wallet Balance Card */}
                <div className="flex w-full flex-col rounded-3xl bg-white p-5 shadow-xs ring-1 ring-gray-100/70">
                    <div className="flex items-center gap-3">
                        <Icon icon="mdi:wallet-outline" className="h-6 w-6 text-gray-500" />
                        <span className="text-base font-black text-gray-800">
                            Wallet Balance: ₹{order.walletBalance.toLocaleString("en-IN")}
                        </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed font-semibold text-gray-400">
                        Price difference will be automatically adjusted in your ROS Wallet and
                        applied to your next order.
                    </p>
                </div>

                {/* Payment Info Card */}
                {order.paymentPaidAt && (
                    <div className="flex w-full flex-col rounded-3xl bg-white p-5 shadow-xs ring-1 ring-gray-100/70">
                        <h3 className="mb-4 text-sm font-bold text-gray-500">Payment Info</h3>

                        <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-400">Amount Paid</span>
                                <span className="mt-1 text-base font-black text-gray-800">
                                    ₹{order.amountToPay.toLocaleString("en-IN")}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-400">
                                    Payment Mode
                                </span>
                                <span className="mt-1 text-base font-black text-[#0B4E3E]">
                                    {order.paymentMethod}
                                </span>
                            </div>
                        </div>

                        <span className="mt-4 text-xs font-bold text-gray-400">
                            {order.paymentPaidAt}
                        </span>
                    </div>
                )}
            </main>

            {/* Footer Action Button */}
            <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-gray-100 bg-white p-4">
                <button
                    disabled={downloading}
                    onClick={handleDownloadInvoice}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gray-800 text-lg font-black text-white shadow-sm transition-all hover:bg-gray-900 active:scale-98 disabled:opacity-50"
                >
                    {downloading ? (
                        <>
                            <Icon icon="mdi:loading" className="h-6 w-6 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Icon icon="mdi:download" className="h-5 w-5" />
                            Download Invoice
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
