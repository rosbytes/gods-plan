import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import { trpc } from "../lib/trpc"
import { useCartStore, type CatalogItem } from "../store/useCartStore"
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

export default function ReviewOrder() {
    const navigate = useNavigate()
    const { items, getTotalItems, getTotalWeight, getEstimatedTotal, clearCart, updateQuantity } =
        useCartStore()

    const [editingItem, setEditingItem] = useState<CatalogItem | null>(null)

    const totalItems = getTotalItems()
    const totalWeight = getTotalWeight()
    const estimatedTotal = getEstimatedTotal()

    const [paymentMethod, setPaymentMethod] = useState<"pay_online" | "pay_at_pickup">("pay_online")
    const [submitting, setSubmitting] = useState(false)

    // Redirect to home if cart is empty
    useEffect(() => {
        if (totalItems === 0 && !submitting) {
            navigate("/home")
        }
    }, [totalItems, navigate, submitting])

    const { data: checkoutDetails, isLoading: loadingDetails } =
        trpc.order.getCheckoutDetails.useQuery()

    // Generate idempotency key once per checkout session
    const idempotencyKey = useMemo(() => crypto.randomUUID(), [])

    // Razorpay order creation mutation
    const { mutateAsync: createRzpOrder } = trpc.order.createRazorpayOrder.useMutation()

    // Place order mutation
    const { mutate: doPlaceOrder, isPending: placingOrder } = trpc.order.placeOrder.useMutation({
        onSuccess: (data) => {
            const itemsCopy = Object.values(items)
            clearCart()
            navigate("/order-success", {
                state: {
                    orderId: data.id,
                    orderCode: data.orderCode,
                    paymentMethod,
                    checkoutDetails,
                    items: itemsCopy,
                    totalItems,
                    totalWeight,
                    estimatedTotal,
                },
            })
        },
        onError: (err) => {
            toast.error(err.message || "Failed to place order")
            setSubmitting(false)
        },
    })

    // Cart item mutation for the modal edit controls
    const { mutate: updateCart } = trpc.cart.updateItem.useMutation({
        onError: (err) => {
            toast.error(err.message || "Failed to update cart")
        },
    })

    const handleModalQtyChange = (delta: number) => {
        if (!editingItem) return
        const currentQty = items[editingItem.id]?.quantityKg || 0
        const newQty = Math.max(0, currentQty + delta)
        updateQuantity(editingItem, delta)
        updateCart({
            vegId: editingItem.id,
            mandiStoreId: editingItem.mandiStoreId,
            quantityKg: newQty,
        })
    }

    // Tomorrow's Date String
    const tomorrowDateString = useMemo(() => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow
            .toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                weekday: "long",
            })
            .replace(/^[a-zA-Z]+,\s/, "") // Remove day name for exactly matching UI format e.g. "18 July"
    }, [])

    const handleCheckout = async () => {
        if (submitting || placingOrder) return
        setSubmitting(true)

        if (paymentMethod === "pay_at_pickup") {
            doPlaceOrder({
                paymentMethod: "pay_at_pickup",
                idempotencyKey,
            })
            return
        }

        // Pay Online Flow
        try {
            const sdkLoaded = await loadRazorpayScript()
            if (!sdkLoaded) {
                toast.error("Razorpay SDK failed to load. Please check your internet connection.")
                setSubmitting(false)
                return
            }

            // Create order on Razorpay first
            const rzpOrder = await createRzpOrder({})

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_ScXb3EUNgGhxZk",
                amount: rzpOrder.amount,
                currency: "INR",
                name: "ROS Market",
                description: "Order Checkout",
                order_id: rzpOrder.orderId,
                handler: function (response: any) {
                    doPlaceOrder({
                        paymentMethod: "pay_online",
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
                        setSubmitting(false)
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
            setSubmitting(false)
        }
    }

    const orderItems = Object.values(items)

    return (
        <div className="relative min-h-screen bg-[#F8F9FA] pb-32">
            {/* Header */}
            <div className="sticky top-0 z-40 flex items-center gap-4 bg-[#F8F9FA] px-6 py-4">
                <button
                    onClick={() => navigate("/home")}
                    className="text-gray-700 transition-colors hover:text-gray-900"
                >
                    <Icon icon="mdi:arrow-left" className="h-7 w-7" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Review Order</h1>
            </div>

            {/* Content */}
            <main className="flex flex-col gap-4 px-4 pb-4">
                {/* Tomorrow's Order */}
                <div className="flex w-full flex-col rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                    <h2 className="mb-4 text-base font-semibold text-gray-500">Tomorrow's Order</h2>

                    <div className="flex flex-col gap-4 divide-y divide-gray-100">
                        {orderItems.map((item, idx) => {
                            const imageSrc =
                                item.veg.vegPrimaryImage || "https://placehold.co/100x100?text=Veg"
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
                                        <button
                                            onClick={() => setEditingItem(item.veg)}
                                            className="flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 text-xs font-bold text-gray-600 ring-1 ring-gray-200/50 transition-colors hover:bg-gray-100"
                                        >
                                            <Icon icon="mdi:pencil-outline" className="h-3 w-3" />
                                            Edit
                                        </button>
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
                    <h2 className="mb-4 text-base font-semibold text-gray-500">Bill Details</h2>

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
                    <h2 className="mb-4 text-base font-semibold text-gray-500">Payment Method</h2>

                    <div className="flex flex-col gap-4 divide-y divide-gray-100">
                        {/* Pay Online */}
                        <label className="flex cursor-pointer items-start gap-3 pt-1 pb-4">
                            <input
                                type="radio"
                                name="payment_method"
                                checked={paymentMethod === "pay_online"}
                                onChange={() => setPaymentMethod("pay_online")}
                                className="sr-only"
                            />
                            <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-gray-300">
                                {paymentMethod === "pay_online" && (
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#0B4E3E]" />
                                )}
                            </div>
                            <div className="flex flex-1 flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-bold text-gray-900">
                                        Pay Online
                                    </span>
                                    <span className="text-2xs rounded-full bg-[#E6F3F0] px-2.5 py-0.5 font-semibold text-[#0B4E3E]">
                                        Recommended
                                    </span>
                                </div>
                                <span className="mt-1 text-sm leading-relaxed font-medium text-gray-400">
                                    Pay online now and collect your order without making separate
                                    payments at each mandi vendor.
                                </span>
                            </div>
                        </label>

                        {/* Pay at Pickup */}
                        <label className="flex cursor-pointer items-start gap-3 pt-4">
                            <input
                                type="radio"
                                name="payment_method"
                                checked={paymentMethod === "pay_at_pickup"}
                                onChange={() => setPaymentMethod("pay_at_pickup")}
                                className="sr-only"
                            />
                            <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-gray-300">
                                {paymentMethod === "pay_at_pickup" && (
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#0B4E3E]" />
                                )}
                            </div>
                            <div className="flex flex-1 flex-col">
                                <span className="text-base font-bold text-gray-900">
                                    Pay at Pickup
                                </span>
                                <span className="mt-1 text-sm leading-relaxed font-medium text-gray-400">
                                    Pay each mandi vendor individually while collecting your
                                    vegetables.
                                </span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Pickup Information */}
                <div className="flex w-full flex-col rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                    <h2 className="mb-4 text-base font-semibold text-gray-500">
                        Pickup Information
                    </h2>

                    <div className="flex flex-col gap-4">
                        {loadingDetails ? (
                            <div className="flex items-center justify-center py-4">
                                <Icon
                                    icon="mdi:loading"
                                    className="h-6 w-6 animate-spin text-[#0B4E3E]"
                                />
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    <Icon
                                        icon="mdi:map-marker-outline"
                                        className="h-5 w-5 text-gray-500"
                                    />
                                    <span className="text-sm font-bold text-[#0B4E3E]">
                                        Slot {checkoutDetails?.slot || 2}
                                    </span>
                                    <span className="text-sm font-bold text-gray-700">
                                        {checkoutDetails?.mandiAddress}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Icon
                                        icon="mdi:calendar-blank-outline"
                                        className="h-5 w-5 text-gray-500"
                                    />
                                    <span className="text-sm font-semibold text-gray-600">
                                        Tomorrow, {tomorrowDateString}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Icon
                                        icon="mdi:clock-outline"
                                        className="h-5 w-5 text-gray-500"
                                    />
                                    <span className="text-sm font-semibold text-gray-600">
                                        {checkoutDetails?.slotTime}
                                    </span>
                                </div>
                            </>
                        )}
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

            {/* Sticky Order Button */}
            <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-gray-100 bg-white p-4">
                <button
                    disabled={submitting || placingOrder || loadingDetails}
                    onClick={handleCheckout}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#0B4E3E] text-lg font-semibold text-white shadow-sm transition-colors hover:bg-[#083a2e] active:bg-[#062c23] disabled:opacity-50"
                >
                    {submitting || placingOrder ? (
                        <>
                            <Icon icon="mdi:loading" className="h-6 w-6 animate-spin" />
                            Processing...
                        </>
                    ) : paymentMethod === "pay_online" ? (
                        `Pay ₹${estimatedTotal.toLocaleString("en-IN")}`
                    ) : (
                        "Place Order"
                    )}
                </button>
            </div>
            {/* Edit Quantity Modal */}
            {editingItem && (
                <div
                    className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={() => setEditingItem(null)}
                >
                    <div
                        className="animate-scale-in relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header info */}
                        <div className="flex items-start gap-4">
                            <img
                                src={
                                    editingItem.vegPrimaryImage ||
                                    "https://placehold.co/100x100?text=Veg"
                                }
                                alt={editingItem.name}
                                className="h-16 w-16 rounded-2xl object-cover ring-1 ring-gray-100"
                            />
                            <div className="flex flex-1 flex-col justify-center">
                                <h3 className="text-lg leading-tight font-bold text-gray-900">
                                    {editingItem.name}/ {editingItem.nameInHindi}
                                </h3>
                                <p className="mt-1 text-sm font-medium text-gray-500">
                                    Est. Price ₹{editingItem.estimatedPrice}/Kg
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-gray-900">Est.</span>
                                <span className="text-lg font-bold text-gray-900">
                                    ₹
                                    {(
                                        (items[editingItem.id]?.quantityKg || 0) *
                                        editingItem.estimatedPrice
                                    ).toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>

                        {/* Quick Add Buttons */}
                        <div className="mt-6 flex flex-wrap items-center gap-2">
                            {[10, 50, 100].map((kg) => (
                                <button
                                    key={kg}
                                    type="button"
                                    onClick={() => handleModalQtyChange(kg)}
                                    className="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-200 active:bg-gray-300"
                                >
                                    +{kg} kg
                                </button>
                            ))}
                        </div>

                        {/* Stepper with input */}
                        <div className="mt-6 flex h-14 w-full items-center justify-between rounded-2xl bg-gray-50 p-1">
                            <button
                                type="button"
                                onClick={() => handleModalQtyChange(-1)}
                                disabled={(items[editingItem.id]?.quantityKg || 0) <= 0}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-gray-900 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                            >
                                <Icon icon="mdi:minus" className="h-6 w-6" />
                            </button>

                            <div className="flex items-center justify-center gap-1">
                                <input
                                    type="number"
                                    value={items[editingItem.id]?.quantityKg || 0}
                                    onChange={(e) => {
                                        const val = Math.max(0, Number(e.target.value))
                                        updateQuantity(editingItem, val, true)
                                        updateCart({
                                            vegId: editingItem.id,
                                            mandiStoreId: editingItem.mandiStoreId,
                                            quantityKg: val,
                                        })
                                    }}
                                    className="w-16 bg-transparent text-center text-lg font-bold text-gray-900 focus:outline-none"
                                />
                                <span className="text-lg font-bold text-gray-900">kg</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleModalQtyChange(1)}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B4E3E] text-white shadow-sm transition-colors hover:bg-[#083a2e]"
                            >
                                <Icon icon="mdi:plus" className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
