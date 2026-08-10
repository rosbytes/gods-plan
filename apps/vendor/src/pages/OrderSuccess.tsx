import { useNavigate, useLocation } from "react-router-dom"
import { Icon } from "@iconify/react"
import { useMemo, useState, useEffect } from "react"
import { trpc } from "../lib/trpc"
import { toast } from "sonner"

declare global {
    interface Window {
        Razorpay: any
    }
}

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })
}

export default function OrderSuccess() {
    const navigate = useNavigate()
    const location = useLocation()

    const state = location.state as {
        orderId?: string
        orderCode?: string
        paymentMethod?: "pay_online" | "pay_at_pickup"
        checkoutDetails?: {
            mandiName: string
            mandiAddress: string
            slot: number
            slotTime: string
        }
        items?: {
            veg: {
                id: string
                name: string
                nameInHindi: string | null
                vegPrimaryImage: string | null
                estimatedPrice: number
            }
            quantityKg: number
        }[]
        totalItems?: number
        totalWeight?: number
        estimatedTotal?: number
    } | null

    const orderId = state?.orderId || ""
    const shouldFetch = !state?.items || state.items.length === 0
    const { data: dbDetails, isLoading } = trpc.order.getOrderDetails.useQuery(
        { orderId },
        { enabled: shouldFetch && !!orderId },
    )

    const orderCode = state?.orderCode || dbDetails?.orderCode || "ORD-SUCCESS"
    const paymentMethod =
        state?.paymentMethod ||
        (dbDetails?.paymentMethod === "Online"
            ? ("pay_online" as const)
            : ("pay_at_pickup" as const))
    const checkoutDetails = state?.checkoutDetails || dbDetails?.checkoutDetails
    const items = state?.items && state.items.length > 0 ? state.items : dbDetails?.items || []
    const totalItems =
        state?.totalItems !== undefined ? state.totalItems : dbDetails?.totalItems || 0
    const totalWeight =
        state?.totalWeight !== undefined ? state.totalWeight : dbDetails?.totalWeight || 0
    const estimatedTotal =
        state?.estimatedTotal !== undefined ? state.estimatedTotal : dbDetails?.estimatedTotal || 0

    // Local payment method state to dynamically switch screen if they pay online from success screen
    const [localPaymentMethod, setLocalPaymentMethod] = useState<"pay_online" | "pay_at_pickup">(
        paymentMethod,
    )
    const [paying, setPaying] = useState(false)

    useEffect(() => {
        if (dbDetails?.paymentMethod) {
            setLocalPaymentMethod(
                dbDetails.paymentMethod === "Online" ? "pay_online" : "pay_at_pickup",
            )
        }
    }, [dbDetails])

    // Generate a secure idempotency key for this session
    const idempotencyKey = useMemo(() => crypto.randomUUID(), [])

    // Tomorrow's Date String / Order Placed Date
    const tomorrowDateString = useMemo(() => {
        let date = new Date()
        if (state?.checkoutDetails) {
            // Fresh checkout tomorrow
            date.setDate(date.getDate() + 1)
        } else if (dbDetails?.placedAt) {
            // Past order date
            date = new Date(dbDetails.placedAt)
        } else {
            date.setDate(date.getDate() + 1)
        }
        return date
            .toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                weekday: "long",
            })
            .replace(/^[a-zA-Z]+,\s/, "")
    }, [state, dbDetails])

    const { mutateAsync: createRzpOrder } = trpc.order.createRazorpayOrder.useMutation()

    const { mutate: doPayOrder } = trpc.order.payOrder.useMutation({
        onSuccess: () => {
            setLocalPaymentMethod("pay_online")
            toast.success("Payment verified successfully!")
            setPaying(false)
        },
        onError: (err) => {
            toast.error(err.message || "Failed to verify payment")
            setPaying(false)
        },
    })

    if (shouldFetch && isLoading) {
        return (
            <div className="relative flex min-h-screen items-center justify-center bg-[#F8F9FA]">
                <Icon icon="mdi:loading" className="h-8 w-8 animate-spin text-[#0B4E3E]" />
            </div>
        )
    }

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

            // Create order on Razorpay for this existing DB order
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
                        toast.error("Payment cancelled")
                    },
                },
                theme: {
                    color: "#0B4E3E",
                },
            }

            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (err: any) {
            toast.error(err.message || "Payment initiation failed")
            setPaying(false)
        }
    }

    // ── 1. Paid Online Success Screen ──────────────────────────────────────────
    if (localPaymentMethod === "pay_online") {
        return (
            <div className="relative min-h-screen bg-[#F8F9FA] pb-24">
                {/* Header Graphic */}
                <div className="flex flex-col items-center justify-center pt-8 pb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0B4E3E] text-white">
                        <Icon icon="mdi:check" className="h-10 w-10" />
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-gray-800">Orders Placed</h1>
                </div>

                {/* Main Content */}
                <main className="flex flex-col gap-4 px-4 pb-4">
                    {/* Pickup Information */}
                    <div className="flex w-full flex-col rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                        <h2 className="mb-3 border-b border-gray-100 pb-2 text-base font-semibold text-gray-500">
                            Pickup Information
                        </h2>

                        <div className="flex flex-col gap-3">
                            <h3 className="text-2xl font-black text-[#0B4E3E]">
                                SLOT {checkoutDetails?.slot || 2}
                            </h3>
                            <div className="flex items-center gap-3">
                                <Icon
                                    icon="mdi:map-marker-outline"
                                    className="h-5 w-5 text-gray-400"
                                />
                                <span className="text-sm font-semibold text-gray-600">
                                    {checkoutDetails?.mandiAddress || "Mohana Mandi, Jaipur"}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Icon
                                    icon="mdi:calendar-blank-outline"
                                    className="h-5 w-5 text-gray-400"
                                />
                                <span className="text-sm font-semibold text-gray-600">
                                    Tomorrow, {tomorrowDateString}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Icon icon="mdi:clock-outline" className="h-5 w-5 text-gray-400" />
                                <span className="text-sm font-semibold text-gray-600">
                                    {checkoutDetails?.slotTime || "04:00 AM - 06:00 AM"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tomorrow's Order */}
                    <div className="flex w-full flex-col rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                        <h2 className="mb-4 border-b border-gray-100 pb-2 text-base font-semibold text-gray-500">
                            Tomorrow's Order
                        </h2>

                        <div className="flex flex-col gap-4 divide-y divide-gray-100">
                            {items.map((item, idx) => {
                                const imageSrc =
                                    item.veg.vegPrimaryImage ||
                                    "https://placehold.co/100x100?text=Veg"
                                return (
                                    <div
                                        key={item.veg.id}
                                        className={`flex items-start gap-4 ${idx > 0 ? "pt-4" : ""}`}
                                    >
                                        <img
                                            src={imageSrc}
                                            alt={item.veg.name}
                                            className="h-14 w-14 rounded-xl object-cover ring-1 ring-gray-100"
                                        />
                                        <div className="flex flex-1 flex-col">
                                            <h3 className="text-base leading-tight font-bold text-gray-900">
                                                {item.veg.name}/ {item.veg.nameInHindi}
                                            </h3>
                                            <span className="mt-1 text-xs font-semibold text-gray-400">
                                                ₹{item.veg.estimatedPrice}/Kg
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end justify-between self-stretch">
                                            <span className="mt-2 text-sm font-semibold text-gray-500">
                                                {item.quantityKg} Kg{" "}
                                                <span className="mx-1 text-gray-300">|</span>{" "}
                                                <span className="font-bold text-gray-900">
                                                    ₹
                                                    {(
                                                        item.quantityKg * item.veg.estimatedPrice
                                                    ).toLocaleString("en-IN")}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Bill Details */}
                    <div className="flex w-full flex-col rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                        <h2 className="mb-4 border-b border-gray-100 pb-2 text-base font-semibold text-gray-500">
                            Bill Details
                        </h2>

                        <div className="flex flex-col gap-3 border-b border-gray-100 pb-4">
                            <div className="flex items-center justify-between text-base font-medium">
                                <span className="text-gray-500">Total Items</span>
                                <span className="text-gray-900">{totalItems}</span>
                            </div>
                            <div className="flex items-center justify-between text-base font-medium">
                                <span className="text-gray-500">Total Quantity</span>
                                <span className="font-bold text-gray-900">{totalWeight} Kg</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 text-lg font-bold">
                            <span className="text-gray-900">Est. Total</span>
                            <span className="text-[#0B4E3E]">
                                ₹{estimatedTotal.toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="flex w-full flex-col rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                        <h2 className="mb-4 border-b border-gray-100 pb-2 text-base font-semibold text-gray-500">
                            Payment Method
                        </h2>

                        <div className="flex items-start gap-3 pt-1">
                            <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-[#0B4E3E]">
                                <div className="h-2.5 w-2.5 rounded-full bg-[#0B4E3E]" />
                            </div>
                            <div className="flex flex-1 flex-col">
                                <span className="text-base font-bold text-[#0B4E3E]">
                                    Paid Online
                                </span>
                                <span className="mt-1 text-sm leading-relaxed font-medium text-gray-400">
                                    Pay online now and collect your order without making separate
                                    payments at each mandi vendor.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="flex items-start gap-3 rounded-2xl bg-gray-100 p-4">
                        <Icon
                            icon="mdi:information-outline"
                            className="mt-0.5 h-5 w-5 text-gray-500"
                        />
                        <p className="flex-1 text-xs leading-relaxed font-semibold text-gray-500">
                            Today's payment is based on the expected mandi price. Any difference
                            after pickup will be adjusted automatically in your ROS Wallet.
                        </p>
                    </div>
                </main>

                {/* Footer Action */}
                <div className="mt-8 flex w-full justify-center">
                    <button
                        onClick={() => navigate("/home")}
                        className="text-lg font-bold text-[#0B4E3E] transition-all hover:underline"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        )
    }

    // ── 2. Pay at Pickup Success Screen ────────────────────────────────────────
    return (
        <div className="relative min-h-screen bg-[#F8F9FA] pb-32">
            {/* Header Graphic */}
            <div className="flex flex-col items-center justify-center pt-8 pb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0B4E3E] text-white">
                    <Icon icon="mdi:check" className="h-10 w-10" />
                </div>
                <h1 className="mt-4 text-2xl font-bold text-gray-800">Orders Placed</h1>
            </div>

            {/* Main Content */}
            <main className="flex flex-col gap-4 px-4 pb-4">
                {/* Pickup Information */}
                <div className="flex w-full flex-col rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:map-marker-outline" className="h-5 w-5 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700">
                                {checkoutDetails?.mandiAddress || "Mohana Mandi, Jaipur"}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Icon
                                icon="mdi:calendar-blank-outline"
                                className="h-5 w-5 text-gray-500"
                            />
                            <span className="text-sm font-semibold text-gray-700">
                                Tomorrow, {tomorrowDateString}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:clock-outline" className="h-5 w-5 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700">
                                {checkoutDetails?.slotTime || "04:00 AM - 06:00 AM"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bill Details */}
                <div className="flex w-full flex-col rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                    <h2 className="mb-4 border-b border-gray-100 pb-2 text-base font-semibold text-gray-500">
                        Bill Details
                    </h2>

                    <div className="flex flex-col gap-3 border-b border-gray-100 pb-4">
                        <div className="flex items-center justify-between text-base font-medium">
                            <span className="text-gray-500">Total Items</span>
                            <span className="text-gray-900">{totalItems}</span>
                        </div>
                        <div className="flex items-center justify-between text-base font-medium">
                            <span className="text-gray-500">Total Quantity</span>
                            <span className="font-bold text-gray-900">{totalWeight} Kg</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 text-lg font-bold">
                        <span className="text-gray-900">Est. Total</span>
                        <span className="text-[#0B4E3E]">
                            ₹{estimatedTotal.toLocaleString("en-IN")}
                        </span>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="flex w-full flex-col rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                    <h2 className="mb-4 border-b border-gray-100 pb-2 text-base font-semibold text-gray-500">
                        Payment Method
                    </h2>

                    <div className="flex items-start gap-3 pt-1">
                        <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-[#0B4E3E]">
                            <div className="h-2.5 w-2.5 rounded-full bg-[#0B4E3E]" />
                        </div>
                        <div className="flex flex-1 flex-col">
                            <span className="text-base font-bold text-[#0B4E3E]">
                                Pay at Pickup
                            </span>
                            <span className="mt-1 text-sm leading-relaxed font-medium text-gray-400">
                                Pay each mandi vendor individually while collecting your vegetables.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="flex items-start gap-3 rounded-2xl bg-gray-100 p-4">
                    <Icon icon="mdi:information-outline" className="mt-0.5 h-5 w-5 text-gray-500" />
                    <p className="flex-1 text-xs leading-relaxed font-semibold text-gray-500">
                        Today's payment is based on the expected mandi price. Any difference after
                        pickup will be adjusted automatically in your ROS Wallet.
                    </p>
                </div>
            </main>

            {/* Bottom Actions */}
            <div className="fixed right-0 bottom-0 left-0 z-40 flex flex-col gap-4 border-t border-gray-100 bg-white p-4">
                <button
                    disabled={paying}
                    onClick={handlePayNow}
                    className="flex h-14 w-full items-center justify-center rounded-xl bg-[#0B4E3E] text-lg font-semibold text-white shadow-sm transition-colors hover:bg-[#083a2e] disabled:opacity-50"
                >
                    {paying ? (
                        <>
                            <Icon icon="mdi:loading" className="mr-2 h-6 w-6 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        `Pay Now ₹${estimatedTotal.toLocaleString("en-IN")}`
                    )}
                </button>

                <button
                    onClick={() => navigate("/home")}
                    className="self-center text-center text-lg font-bold text-[#0B4E3E] transition-all hover:underline"
                >
                    Go to Home
                </button>
            </div>
        </div>
    )
}
