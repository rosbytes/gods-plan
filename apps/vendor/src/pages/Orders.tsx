import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import { trpc } from "../lib/trpc"
import { BottomNav } from "../components/layout/BottomNav"
import { toast } from "sonner"

export default function Orders() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState("")

    // Fetch vendor orders
    const {
        data: orders = [],
        isLoading,
        isError,
        refetch,
    } = trpc.order.getOrders.useQuery({ searchQuery })

    // Help Support Click
    const handleHelpClick = () => {
        toast.info("ROS counter support has been notified. We will contact you shortly.")
    }

    // Format date string for displaying in the card
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const today = new Date()
        const yesterday = new Date()
        yesterday.setDate(today.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
            return "Today"
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday"
        }

        const dateFormatted = date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        const timeFormatted = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
        return `${dateFormatted}\n${timeFormatted}`
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

    const handleOrderClick = (orderId: string) => {
        navigate(`/orders/${orderId}`)
    }

    return (
        <div className="relative min-h-screen bg-[#F8F9FA] pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between bg-[#F8F9FA] px-6 py-4">
                <h1 className="text-xl font-bold text-gray-900">Orders</h1>
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
                {/* Search Bar */}
                <div className="relative flex w-full items-center">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by date or order ID"
                        className="w-full rounded-2xl border-0 bg-white px-4 py-3 pr-12 text-sm text-gray-800 placeholder-gray-400 shadow-sm ring-1 ring-gray-200/50 focus:ring-1 focus:ring-[#0B4E3E] focus:outline-none"
                    />
                    <Icon icon="mdi:magnify" className="absolute right-4 h-6 w-6 text-gray-400" />
                </div>

                {/* Orders List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center rounded-4xl bg-white px-6 py-16 text-center shadow-xs ring-1 ring-gray-100/70">
                        <Icon
                            icon="fluent:box-24-regular"
                            className="mb-6 h-28 w-28 animate-pulse text-gray-300"
                        />
                        <h2 className="text-xl font-black text-gray-900">Loading Orders ...</h2>
                    </div>
                ) : isError ? (
                    <div className="flex w-full flex-col gap-4">
                        <div className="flex flex-col items-center justify-center rounded-4xl bg-white px-6 py-16 text-center shadow-xs ring-1 ring-gray-100/70">
                            <Icon
                                icon="fluent:box-24-regular"
                                className="mb-6 h-28 w-28 text-gray-300"
                            />
                            <h2 className="text-xl font-black text-gray-900">
                                Couldn't load your orders
                            </h2>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gray-800 text-lg font-black text-white shadow-sm transition-all hover:bg-gray-900 active:scale-[0.98]"
                        >
                            <Icon icon="mdi:reload" className="h-5 w-5" />
                            Reload
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    searchQuery ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                            <Icon
                                icon="fluent:shopping-bag-24-regular"
                                className="mb-2 h-16 w-16 text-gray-300"
                            />
                            rounded-4xl
                            <p className="text-sm font-medium">No orders found</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-4xl bg-white px-6 py-16 text-center shadow-xs ring-1 ring-gray-100/70">
                            <Icon
                                icon="fluent:box-24-regular"
                                className="mb-6 h-28 w-28 text-gray-300"
                            />
                            <h2 className="text-xl font-black text-gray-900">No Orders Yet</h2>
                            <p className="mt-2 max-w-60 text-sm leading-relaxed font-semibold text-gray-400">
                                Your orders will appear here once you place your first order.
                            </p>
                        </div>
                    )
                ) : (
                    <div className="flex flex-col gap-4">
                        {orders.map((order) => {
                            const badgeStyle = getStatusStyle(order.statusLabel)
                            return (
                                <div
                                    key={order.id}
                                    onClick={() => handleOrderClick(order.id)}
                                    className="flex w-full cursor-pointer flex-col rounded-3xl bg-white p-5 shadow-xs ring-1 ring-gray-100/70 transition-all hover:shadow-md active:scale-[0.99]"
                                >
                                    {/* Top Line: Badge + Date */}
                                    <div className="flex items-start justify-between">
                                        <span
                                            className={`text-2xs rounded-full px-3 py-1 font-extrabold tracking-wide ${badgeStyle.bg} ${badgeStyle.text}`}
                                        >
                                            {order.statusLabel}
                                        </span>
                                        <span className="text-right text-xs leading-relaxed font-bold whitespace-pre-line text-gray-400">
                                            {formatDate(order.placedAt)}
                                        </span>
                                    </div>

                                    {/* Middle Line: Weight + Items count */}
                                    <div className="mt-3.5 flex items-baseline gap-2">
                                        <span className="text-xl font-black text-gray-800">
                                            {order.totalQuantityKg.toLocaleString("en-IN")}Kg
                                        </span>
                                        <span className="text-sm font-extrabold text-gray-400">
                                            {order.totalItemsCount} Items
                                        </span>
                                    </div>

                                    {/* Order Reference */}
                                    <span className="mt-1 text-xs font-bold text-gray-400">
                                        Order ID: {order.orderCode}
                                    </span>

                                    {/* Divider */}
                                    <div className="my-4 border-t border-gray-100" />

                                    {/* Bottom Line: Price / Paid details + Arrow */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-black text-gray-800">
                                                ₹{order.totalAmount.toLocaleString("en-IN")}
                                            </span>
                                            <span className="text-xs font-extrabold text-gray-400">
                                                {order.paymentLabel}
                                            </span>
                                        </div>
                                        <Icon
                                            icon="mdi:chevron-right"
                                            className="h-6 w-6 text-gray-400 transition-colors hover:text-gray-600"
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* Bottom Nav */}
            <BottomNav />
        </div>
    )
}
