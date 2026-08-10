import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import { trpc } from "../lib/trpc"
import { BottomNav } from "../components/layout/BottomNav"
import { toast } from "sonner"

type TabType = "all" | "pending" | "collected"

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })
}

export default function Pickup() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<TabType>("pending")
    const [searchQuery, setSearchQuery] = useState("")
    const [paying, setPaying] = useState(false)
    const [paymentState, setPaymentState] = useState<"none" | "success" | "failed">("none")
    const [successProgress, setSuccessProgress] = useState("0%")

    // Fetch today's pickup items and metadata
    const { data: pickupData, isLoading, isError, refetch } = trpc.pickup.getPickupItems.useQuery()

    // Extract fields from new backend structure
    const pickupItems = useMemo(() => pickupData?.items ?? [], [pickupData])
    const isPaid = pickupData?.isPaid ?? true
    const totalAmountToPay = pickupData?.totalAmountToPay ?? 0
    const orderId = pickupData?.orderId ?? null
    const orderCode = pickupData?.orderCode ?? "ORD-SUCCESS"
    const counterName = pickupData?.counterName ?? "ROS Counter"
    const counterAddress = pickupData?.counterAddress ?? "Mandi Premises"
    const counterLat = pickupData?.counterLat ?? null
    const counterLng = pickupData?.counterLng ?? null
    const mandiName = pickupData?.mandiName ?? ""

    // ── Razorpay Mutations ───────────────────────────────────────────────────
    const { mutateAsync: createRzpOrder } = trpc.order.createRazorpayOrder.useMutation()
    const { mutate: doPayOrder } = trpc.order.payOrder.useMutation({
        onSuccess: () => {
            setPaymentState("success")
            setPaying(false)
        },
        onError: (err) => {
            setPaymentState("failed")
            toast.error(err.message || "Failed to verify payment")
            setPaying(false)
        },
    })

    const idempotencyKey = useMemo(() => crypto.randomUUID(), [])

    // Effect to animate thin progress bar on payment success card, then unlock pickup list
    useEffect(() => {
        if (paymentState === "success") {
            const timer = setTimeout(() => {
                setSuccessProgress("100%")
            }, 50)
            const finishTimer = setTimeout(() => {
                setPaymentState("none")
                setSuccessProgress("0%")
                refetch()
            }, 1600)
            return () => {
                clearTimeout(timer)
                clearTimeout(finishTimer)
            }
        }
    }, [paymentState, refetch])

    // ── Time checks ──────────────────────────────────────────────────────────
    const isBefore4AM = useMemo(() => {
        const hour = new Date().getHours()
        return hour < 4
    }, [])

    const hasNoItems = useMemo(() => {
        return pickupItems.length === 0
    }, [pickupItems])

    // ── Date Formatting ──────────────────────────────────────────────────────
    const todayDateString = useMemo(() => {
        const date = new Date()
        const getOrdinal = (n: number) => {
            const s = ["th", "st", "nd", "rd"]
            const v = n % 100
            return n + (s[(v - 20) % 10] || s[v] || s[0])
        }
        const dateFormatted = `${getOrdinal(date.getDate())} ${date.toLocaleDateString("en-IN", { month: "long" })}`

        // Match mock designs (only prepend "Today, " once pickup starts and items exist)
        if (pickupItems.length > 0 && !isBefore4AM && isPaid) {
            return `Today, ${dateFormatted}`
        }
        return dateFormatted
    }, [pickupItems, isBefore4AM, isPaid])

    // ── Help Support Click ────────────────────────────────────────────────────
    const handleHelpClick = () => {
        toast.info("ROS counter support has been notified. We will contact you shortly.")
    }

    // Counts for tabs (always display (0) if pickup not started, no items, or not paid)
    const counts = useMemo(() => {
        let all = 0
        let pending = 0
        let collected = 0

        if (pickupItems.length > 0 && !isBefore4AM && isPaid) {
            pickupItems.forEach((item) => {
                all++
                if (item.status === "collected") {
                    collected++
                } else {
                    pending++
                }
            })
        }
        return { all, pending, collected }
    }, [pickupItems, isBefore4AM, isPaid])

    // Total Quantity
    const totalQuantityKg = useMemo(() => {
        return pickupItems.reduce((sum, item) => sum + item.quantityKg, 0)
    }, [pickupItems])

    // Completion Time
    const completionTime = useMemo(() => {
        let maxTime = 0
        pickupItems.forEach((item) => {
            if (item.status === "collected" && item.updatedAt) {
                const t = new Date(item.updatedAt).getTime()
                if (t > maxTime) maxTime = t
            }
        })
        const targetDate = maxTime > 0 ? new Date(maxTime) : new Date()
        return targetDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
    }, [pickupItems])

    // ── Animation tracking ────────────────────────────────────────────────────
    const todayStr = new Date().toDateString()
    const animSeenKey = `ros_pickup_anim_seen_${todayStr}`

    const [animSeen] = useState(() => {
        return localStorage.getItem(animSeenKey) === "true"
    })

    useEffect(() => {
        const actualCount = pickupItems.length
        if (actualCount > 0 && !isBefore4AM && isPaid && counts.pending === 0 && !animSeen) {
            localStorage.setItem(animSeenKey, "true")
        }
    }, [pickupItems.length, isBefore4AM, isPaid, counts.pending, animSeen, animSeenKey])

    // ── Razorpay Payment Click ───────────────────────────────────────────────
    const handlePayNow = async () => {
        if (paying || !orderId) return
        setPaying(true)

        try {
            const sdkLoaded = await loadRazorpayScript()
            if (!sdkLoaded) {
                toast.error("Razorpay SDK failed to load. Are you online?")
                setPaying(false)
                return
            }

            const rzpOrder = await createRzpOrder({ orderId })

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_ScXb3EUNgGhxZk",
                amount: rzpOrder.amount,
                currency: "INR",
                name: "ROS Market",
                description: `Payment for ${orderCode}`,
                order_id: rzpOrder.orderId,
                handler: function (response: any) {
                    doPayOrder({
                        orderId,
                        idempotencyKey,
                        paymentDetails: {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        },
                    })
                },
                modal: {
                    ondismiss: function () {
                        setPaying(false)
                        setPaymentState("failed")
                        toast.error("Payment cancelled")
                    },
                },
                theme: {
                    color: "#0B4E3E",
                },
            }

            const rzp = new (window as any).Razorpay(options)
            rzp.open()
        } catch (err: any) {
            setPaymentState("failed")
            toast.error(err.message || "Payment initiation failed")
            setPaying(false)
        }
    }

    const handleNavigateCounter = () => {
        if (counterLat && counterLng) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${counterLat},${counterLng}`,
                "_blank",
            )
        } else {
            toast.info("Directions to the counter will be available soon.")
        }
    }

    // ── Search & Tab Filtering ───────────────────────────────────────────────
    const filteredItems = useMemo(() => {
        return pickupItems.filter((item) => {
            // 1. Search Query Filter
            const search = searchQuery.toLowerCase().trim()
            if (search) {
                const matchesVeg = item.vegName.toLowerCase().includes(search)
                const matchesHindi = item.vegNameInHindi?.toLowerCase().includes(search)
                const matchesShop = item.shopName.toLowerCase().includes(search)
                const matchesAddress = item.shopAddress.toLowerCase().includes(search)
                if (!matchesVeg && !matchesHindi && !matchesShop && !matchesAddress) {
                    return false
                }
            }

            // 2. Tab Filter
            if (activeTab === "pending") {
                return item.status === "pending"
            }
            if (activeTab === "collected") {
                return item.status === "collected"
            }
            return true
        })
    }, [pickupItems, activeTab, searchQuery])

    return (
        <div className="relative min-h-screen bg-[#F8F9FA] pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between bg-[#F8F9FA] px-6 py-4">
                <div className="flex items-baseline gap-2">
                    <h1 className="text-xl font-bold text-gray-900">Pickup</h1>
                    <span className="text-sm font-semibold text-gray-500">{todayDateString}</span>
                </div>
                <button
                    onClick={handleHelpClick}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors active:bg-gray-50"
                >
                    <Icon icon="mdi:headphones" className="h-4 w-4 text-gray-500" />
                    Help
                </button>
            </header>

            {/* Main Area */}
            <main className="flex flex-col gap-4 px-4 pb-4">
                {isLoading ? (
                    <div className="mt-2 flex flex-col rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100/80">
                        <div className="flex items-center justify-center py-20">
                            <Icon
                                icon="mdi:loading"
                                className="h-8 w-8 animate-spin text-[#0B4E3E]"
                            />
                        </div>
                    </div>
                ) : isError ? (
                    <div className="mt-2 flex flex-col rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100/80">
                        <div className="flex flex-col items-center justify-center py-16 text-center text-red-500">
                            <Icon icon="mdi:alert-circle-outline" className="mb-2 h-10 w-10" />
                            <p className="text-sm font-semibold">Failed to load pickup items.</p>
                            <button
                                onClick={() => refetch()}
                                className="mt-4 rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600 ring-1 ring-gray-200 hover:bg-gray-200 active:bg-gray-300"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : hasNoItems ? (
                    // ── SCREEN B: NO PICKUP SCHEDULED FOR TODAY (Empty State) ────────────────
                    <div className="flex flex-col gap-4">
                        <div className="flex w-full flex-col items-center justify-center rounded-3xl bg-white p-6 py-8 shadow-sm ring-1 ring-gray-100/80">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100/70 text-gray-400">
                                <Icon icon="fluent:box-24-regular" className="h-14 w-14" />
                            </div>
                            <h2 className="mt-6 max-w-60 text-center text-xl leading-tight font-bold text-gray-900">
                                No pickup scheduled for today
                            </h2>
                            <p className="mt-2 max-w-65 text-center text-sm leading-relaxed font-semibold text-gray-500">
                                Nothing to collect today. Place your next order before{" "}
                                <span className="font-extrabold text-[#0B4E3E]">11:00 PM.</span>
                            </p>
                        </div>

                        {/* Banner B */}
                        <div className="flex items-start gap-3 rounded-2xl bg-gray-100 p-4">
                            <Icon
                                icon="mdi:information-outline"
                                className="mt-0.5 h-5 w-5 text-gray-500"
                            />
                            <p className="flex-1 text-xs leading-relaxed font-bold text-gray-500">
                                Your pickup details will appear here automatically once your order
                                is confirmed.
                            </p>
                        </div>
                    </div>
                ) : !isPaid ? (
                    // ── PAYWALL / PAYMENT SUCCESS / FAILURE SCREENS ─────────────────────────
                    <div className="flex flex-col gap-4">
                        <h2 className="mt-2 px-2 text-lg leading-tight font-bold text-gray-800">
                            One quick payment, then you're ready to collect.
                        </h2>

                        {paymentState === "success" ? (
                            // ── PAYMENT SUCCESS VIEW ──
                            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-3xl bg-white p-8 py-10 shadow-sm ring-1 ring-gray-100/85">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#52A874] text-white">
                                    <Icon icon="mdi:check" className="h-12 w-12" />
                                </div>
                                <h2 className="mt-6 text-2xl font-black text-gray-900">
                                    Payment Successful
                                </h2>
                                <p className="mt-2 text-base font-bold text-gray-500">
                                    ₹{totalAmountToPay.toLocaleString("en-IN")} Paid
                                </p>
                                <p className="mt-6 text-sm font-bold text-gray-400">
                                    Preparing your pickup list...
                                </p>

                                {/* Thin Animated Green Progress Bar */}
                                <div
                                    className="absolute bottom-0 left-0 h-1 bg-[#0B4E3E] transition-all duration-1500 ease-out"
                                    style={{ width: successProgress }}
                                />
                            </div>
                        ) : paymentState === "failed" ? (
                            // ── PAYMENT FAILED VIEW ──
                            <>
                                <div className="flex w-full flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100/85">
                                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#D32F2F] text-white">
                                        <Icon icon="mdi:close" className="h-12 w-12" />
                                    </div>
                                    <h2 className="mt-6 text-center text-xl font-extrabold text-gray-900">
                                        Payment Failed
                                    </h2>
                                    <p className="mx-auto mt-2 max-w-65 text-center text-sm leading-relaxed font-semibold text-gray-500">
                                        Please try your payment again to continue with pickup.
                                    </p>

                                    <div className="my-5 border-t border-gray-100" />

                                    <div className="flex items-center justify-between px-1 text-base">
                                        <span className="font-bold text-gray-400">
                                            Amount to Pay
                                        </span>
                                        <span className="text-lg font-black text-[#0B4E3E]">
                                            ₹{totalAmountToPay.toLocaleString("en-IN")}
                                        </span>
                                    </div>

                                    <button
                                        onClick={handlePayNow}
                                        disabled={paying}
                                        className="hover:bg-primary-hover mt-5 w-full rounded-2xl bg-[#0B4E3E] py-3.5 text-sm font-bold text-white shadow-md transition-colors disabled:bg-gray-300"
                                    >
                                        {paying ? "Processing..." : "Try Again"}
                                    </button>
                                </div>

                                {/* OR Divider */}
                                <div className="my-2 flex items-center gap-4 text-xs font-extrabold text-gray-400 uppercase">
                                    <div className="h-px flex-1 bg-gray-200" />
                                    <span>or</span>
                                    <div className="h-px flex-1 bg-gray-200" />
                                </div>

                                {/* ROS Counter Card */}
                                <div className="flex w-full flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100/85">
                                    <h3 className="text-lg font-extrabold text-gray-900">
                                        Pay at ROS Counter
                                    </h3>
                                    <p className="mt-1 text-xs leading-snug font-bold text-gray-400">
                                        Visit the Counter and complete the payment
                                    </p>

                                    <div className="mt-5 flex items-start gap-3">
                                        <Icon
                                            icon="mdi:map-marker"
                                            className="mt-0.5 h-6 w-6 shrink-0 text-gray-700"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-base leading-tight font-extrabold text-gray-800">
                                                {counterName || "Block A, Near Shop No 13"}
                                            </span>
                                            <span className="mt-0.5 text-xs font-bold text-gray-400">
                                                {mandiName ||
                                                    counterAddress ||
                                                    "Mohana Mandi, Jaipur"}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleNavigateCounter}
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white py-3.5 text-sm font-bold text-gray-800 shadow-2xs transition-colors hover:bg-gray-50"
                                    >
                                        <Icon
                                            icon="mdi:near-me"
                                            className="h-5 w-5 text-gray-600"
                                        />
                                        Navigate to ROS Counter
                                    </button>
                                </div>

                                {/* Bottom Info Note */}
                                <div className="mt-1 flex items-start gap-3 rounded-2xl bg-gray-100/60 p-4">
                                    <Icon
                                        icon="mdi:information-outline"
                                        className="mt-0.5 h-5 w-5 text-gray-500"
                                    />
                                    <p className="flex-1 text-xs leading-relaxed font-bold text-gray-500">
                                        Your pickup list will appear automatically after payment.
                                    </p>
                                </div>
                            </>
                        ) : (
                            // ── DEFAULT PAYWALL SCREEN ──
                            <>
                                {/* Card 1: Pay Online */}
                                <div className="flex w-full flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100/85">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-extrabold text-gray-900">
                                            Pay Online
                                        </span>
                                        <span className="text-2xs rounded-md bg-[#E6F3F0] px-2.5 py-0.5 font-extrabold text-[#0B4E3E]">
                                            Recommended
                                        </span>
                                    </div>

                                    <div className="mt-4 flex flex-col gap-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-bold text-gray-400">
                                                Total Items
                                            </span>
                                            <span className="font-extrabold text-gray-800">
                                                {pickupItems.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-bold text-gray-400">
                                                Total Quantity
                                            </span>
                                            <span className="font-extrabold text-gray-800">
                                                {totalQuantityKg} Kg
                                            </span>
                                        </div>

                                        <div className="my-2 border-t border-gray-100" />

                                        <div className="flex items-center justify-between text-base">
                                            <span className="font-extrabold text-gray-800">
                                                Amount to Pay
                                            </span>
                                            <span className="text-xl font-black text-[#0B4E3E]">
                                                ₹{totalAmountToPay.toLocaleString("en-IN")}
                                            </span>
                                        </div>

                                        <button
                                            onClick={handlePayNow}
                                            disabled={paying}
                                            className="hover:bg-primary-hover mt-3 w-full rounded-2xl bg-[#0B4E3E] py-3.5 text-sm font-bold text-white shadow-md transition-colors disabled:bg-gray-300"
                                        >
                                            {paying
                                                ? "Processing..."
                                                : `Pay ₹${totalAmountToPay.toLocaleString("en-IN")}`}
                                        </button>
                                    </div>

                                    {/* Alert Note */}
                                    <div className="mt-4 flex items-start gap-2.5 text-xs font-bold text-gray-400">
                                        <Icon
                                            icon="mdi:information-outline"
                                            className="h-5 w-5 shrink-0 text-gray-400"
                                        />
                                        <span className="leading-relaxed">
                                            Check the Orders tab for your complete bill and order
                                            summary.
                                        </span>
                                    </div>
                                </div>

                                {/* OR Divider */}
                                <div className="my-2 flex items-center gap-4 text-xs font-extrabold text-gray-400 uppercase">
                                    <div className="h-px flex-1 bg-gray-200" />
                                    <span>or</span>
                                    <div className="h-px flex-1 bg-gray-200" />
                                </div>

                                {/* Card 2: Pay at ROS Counter */}
                                <div className="flex w-full flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100/85">
                                    <h3 className="text-lg font-extrabold text-gray-900">
                                        Pay at ROS Counter
                                    </h3>
                                    <p className="mt-1 text-xs leading-snug font-bold text-gray-400">
                                        Visit the Counter and complete the payment
                                    </p>

                                    <div className="mt-5 flex items-start gap-3">
                                        <Icon
                                            icon="mdi:map-marker"
                                            className="mt-0.5 h-6 w-6 shrink-0 text-gray-700"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-base leading-tight font-extrabold text-gray-800">
                                                {counterName || "Block A, Near Shop No 13"}
                                            </span>
                                            <span className="mt-0.5 text-xs font-bold text-gray-400">
                                                {mandiName ||
                                                    counterAddress ||
                                                    "Mohana Mandi, Jaipur"}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleNavigateCounter}
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white py-3.5 text-sm font-bold text-gray-800 shadow-2xs transition-colors hover:bg-gray-50"
                                    >
                                        <Icon
                                            icon="mdi:near-me"
                                            className="h-5 w-5 text-gray-600"
                                        />
                                        Navigate to ROS Counter
                                    </button>
                                </div>

                                {/* Bottom Info Note */}
                                <div className="mt-1 flex items-start gap-3 rounded-2xl bg-gray-100/60 p-4">
                                    <Icon
                                        icon="mdi:information-outline"
                                        className="mt-0.5 h-5 w-5 text-gray-500"
                                    />
                                    <p className="flex-1 text-xs leading-relaxed font-bold text-gray-500">
                                        Your pickup list will appear automatically after payment.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    // ── STANDARD PICKUP WORKFLOW (Paid / After 4:00 AM) ──────────────────────
                    <>
                        {/* Search Bar */}
                        <div className="relative flex w-full items-center">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search vegetable or shop"
                                className="w-full rounded-2xl border-0 bg-white px-4 py-3 pr-12 text-sm text-gray-800 placeholder-gray-400 shadow-sm ring-1 ring-gray-200/50 focus:ring-1 focus:ring-[#0B4E3E] focus:outline-none"
                            />
                            <Icon
                                icon="mdi:magnify"
                                className="absolute right-4 h-6 w-6 text-gray-400"
                            />
                        </div>

                        {/* Tab Controls */}
                        <div className="mt-1 flex items-center gap-2">
                            <button
                                onClick={() => setActiveTab("all")}
                                className={`rounded-full border px-5 py-2.5 text-sm font-bold shadow-2xs transition-colors ${
                                    activeTab === "all"
                                        ? "border-[#333333] bg-[#333333] text-white"
                                        : "border-gray-200/60 bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                All Items ({counts.all})
                            </button>
                            <button
                                onClick={() => setActiveTab("pending")}
                                className={`rounded-full border px-5 py-2.5 text-sm font-bold shadow-2xs transition-colors ${
                                    activeTab === "pending"
                                        ? "border-[#333333] bg-[#333333] text-white"
                                        : "border-gray-200/60 bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                Pending ({counts.pending})
                            </button>
                            <button
                                onClick={() => setActiveTab("collected")}
                                className={`rounded-full border px-5 py-2.5 text-sm font-bold shadow-2xs transition-colors ${
                                    activeTab === "collected"
                                        ? "border-[#333333] bg-[#333333] text-white"
                                        : "border-gray-200/60 bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                Collected ({counts.collected})
                            </button>
                        </div>

                        {/* Views wrapper */}
                        {isBefore4AM ? (
                            // ── SCREEN A: PICKUP HASN'T STARTED YET (Before 4:00 AM) ───────────────
                            <div className="mt-2 flex flex-col gap-4">
                                <div className="flex w-full flex-col items-center justify-center rounded-3xl bg-white p-6 py-8 shadow-sm ring-1 ring-gray-100/80">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100/70 text-gray-400">
                                        <Icon icon="mdi:clock" className="h-14 w-14" />
                                    </div>
                                    <h2 className="mt-6 text-center text-xl leading-tight font-bold text-gray-900">
                                        Pickup hasn't started yet
                                    </h2>
                                    <p className="mt-2 max-w-70 text-center text-sm leading-relaxed font-semibold text-gray-500">
                                        Your pickup list will appear at 04:00 AM. See you in the
                                        morning!
                                    </p>

                                    {/* Divider */}
                                    <div className="my-6 w-full border-t border-gray-100" />

                                    {/* Starts Row */}
                                    <div className="flex w-full items-center justify-between px-2">
                                        <span className="text-base font-bold text-gray-800">
                                            Pickup Starts
                                        </span>
                                        <span className="text-base font-extrabold text-[#0B4E3E]">
                                            04:00 AM
                                        </span>
                                    </div>
                                </div>

                                {/* Banner A */}
                                <div className="flex items-start gap-3 rounded-2xl bg-gray-100 p-4">
                                    <Icon
                                        icon="mdi:information-outline"
                                        className="mt-0.5 h-5 w-5 text-gray-500"
                                    />
                                    <p className="flex-1 text-xs leading-relaxed font-bold text-gray-500">
                                        No action needed. Your pickup list will appear automatically
                                        at 04:00 AM.
                                    </p>
                                </div>
                            </div>
                        ) : counts.all > 0 && counts.pending === 0 ? (
                            // ── COLLECTION COMPLETE VIEW ─────────────────────────────────────────────
                            <div className="mt-2 flex flex-col gap-4">
                                <div className="flex w-full flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100/80">
                                    {!animSeen ? (
                                        // Large Animated Checkmark (First Collection Today)
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <div className="bg-primary animate-phonepe-circle flex h-24 w-24 items-center justify-center rounded-full text-white">
                                                <svg
                                                    className="h-12 w-12 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                >
                                                    <path
                                                        className="animate-phonepe-check"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </div>
                                            <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
                                                Collection Complete
                                            </h2>
                                            <p className="mt-2 max-w-65 text-center text-sm leading-relaxed font-semibold text-gray-500">
                                                You've collected everything for today. Have a great
                                                day!
                                            </p>
                                        </div>
                                    ) : (
                                        // Small Inline Checkmark (Subsequent opens today)
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <Icon
                                                    icon="mdi:check-circle"
                                                    className="h-7 w-7 shrink-0 text-gray-700"
                                                />
                                                <h2 className="text-xl font-bold text-gray-900">
                                                    Collection Complete
                                                </h2>
                                            </div>
                                            <p className="pl-10 text-sm leading-relaxed font-semibold text-gray-500">
                                                You've collected everything for today. Have a great
                                                day!
                                            </p>
                                        </div>
                                    )}

                                    {/* Divider */}
                                    <div className="my-6 border-t border-gray-100" />

                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 divide-x divide-gray-100">
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                                                Total Items
                                            </span>
                                            <span className="mt-1 text-2xl font-black text-gray-900">
                                                {counts.all}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                                                Total Quantity
                                            </span>
                                            <span className="mt-1 text-2xl font-black text-gray-900">
                                                {totalQuantityKg} Kg
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="my-6 border-t border-gray-100" />

                                    {/* Completed Time */}
                                    <div className="flex items-center justify-center gap-2 pb-2 text-sm font-bold text-gray-500">
                                        <Icon icon="mdi:clock-outline" className="h-5 w-5" />
                                        <span>Completed at {completionTime}</span>
                                    </div>
                                </div>

                                {/* Info Banner */}
                                <div className="flex items-start gap-3 rounded-2xl bg-gray-100 p-4">
                                    <Icon
                                        icon="mdi:information-outline"
                                        className="mt-0.5 h-5 w-5 text-gray-500"
                                    />
                                    <p className="flex-1 text-xs leading-relaxed font-bold text-gray-500">
                                        Your final bill and payment details are available in the{" "}
                                        <button
                                            onClick={() => navigate("/orders")}
                                            className="font-extrabold text-gray-600 underline hover:text-gray-900"
                                        >
                                            Orders tab
                                        </button>
                                        . Any price adjustments have already been applied to your
                                        ROS account.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            // ── PENDING ITEMS LIST VIEW ──────────────────────────────────────────────
                            <div className="mt-2 flex flex-col rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100/80">
                                {filteredItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                                        <Icon
                                            icon="mdi:clipboard-text-outline"
                                            className="mb-2 h-12 w-12 text-gray-300"
                                        />
                                        <p className="text-sm font-medium">No items found</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col divide-y divide-gray-100/70">
                                        {filteredItems.map((item, idx) => {
                                            const imageSrc =
                                                item.vegImage ||
                                                "https://placehold.co/100x100?text=Veg"
                                            const isCollected = item.status === "collected"

                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`flex items-start gap-4 ${idx > 0 ? "pt-4" : ""} ${idx < filteredItems.length - 1 ? "pb-4" : ""}`}
                                                >
                                                    <img
                                                        src={imageSrc}
                                                        alt={item.vegName}
                                                        className="h-14 w-14 rounded-2xl object-cover ring-1 ring-gray-100"
                                                    />
                                                    <div className="flex flex-1 flex-col">
                                                        <h3 className="text-base leading-tight font-bold text-gray-900">
                                                            {item.vegName}
                                                            {item.vegNameInHindi
                                                                ? `/ ${item.vegNameInHindi}`
                                                                : ""}
                                                        </h3>
                                                        <span className="mt-1 text-base leading-tight font-extrabold text-gray-800">
                                                            {item.shopAddress}
                                                        </span>
                                                        <span className="mt-0.5 text-xs font-bold text-gray-400">
                                                            {item.shopName}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-end justify-between self-stretch">
                                                        <span
                                                            className={`text-2xs rounded-full px-2.5 py-0.5 font-bold ${
                                                                isCollected
                                                                    ? "bg-[#E6F3F0] text-[#0B4E3E]"
                                                                    : "bg-gray-100 text-gray-400"
                                                            }`}
                                                        >
                                                            {isCollected ? "Collected" : "Pending"}
                                                        </span>
                                                        <span className="mt-2 text-lg font-black text-gray-800">
                                                            {item.quantityKg} Kg
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    )
}
