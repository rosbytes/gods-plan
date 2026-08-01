import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { parseVendorType } from "../constants/vendor"
import { toast } from "sonner"

// Declare window interface for Razorpay
declare global {
    interface Window {
        Razorpay: any
    }
}

type PaymentMode = "online" | "cash" | "skip"

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })
}

export default function Payment() {
    const navigate = useNavigate()
    const { vendorId, storeId } = useParams<{ vendorId: string; storeId: string }>()
    const [searchParams] = useSearchParams()
    const vendorType = parseVendorType(searchParams.get("type"))
    const typeParam = vendorType ? `&type=${vendorType}` : ""

    const [mode, setMode] = useState<PaymentMode>("online")
    const [skipNote, setSkipNote] = useState("")

    const [orderData, setOrderData] = useState<{
        orderId: string
        keyId: string
        amount: number // received from backend in PAISE
        vendorName?: string
        vendorContact?: string
    } | null>(null)
    const [creating, setCreating] = useState(false)

    // ── tRPC mutations & queries ──────────────────────────────────────────────
    const createOrderMutation = trpc.payment.createOrder.useMutation({
        onSuccess: (data) => {
            setOrderData({
                orderId: data.orderId,
                keyId: data.keyId,
                amount: data.amount, // amount in PAISE from backend
                vendorContact: data.vendorContact,
                vendorName: data.vendorName,
            })
            setCreating(false)
        },
        onError: (err) => {
            toast.error("Failed to create payment order: " + err.message)
            setCreating(false)
        },
    })

    const verifyMutation = trpc.payment.verifyPayment.useMutation({
        onSuccess: (data) => {
            toast.success("Payment verified successfully")
            navigate(
                `/payment-status/${vendorId}/${storeId}?status=success&orderId=${orderData?.orderId}&paymentId=${data.paymentId}${typeParam}`,
            )
        },
        onError: (err) => {
            toast.error("Payment verification failed: " + err.message)
            navigate(
                `/payment-status/${vendorId}/${storeId}?status=failed&orderId=${orderData?.orderId}${typeParam}`,
            )
        },
    })

    const skipMutation = trpc.payment.skipPayment.useMutation({
        onSuccess: (data) => {
            toast.success("Payment skipped — subscription charge marked as pending")
            navigate(
                `/payment-status/${vendorId}/${storeId}?status=pending&method=cash&orderId=${data.transactionId}${typeParam}`,
            )
        },
        onError: (err) => {
            toast.error("Failed to skip payment: " + err.message)
        },
    })

    // ── Create order on mount ─────────────────────────────────────────────────
    useEffect(() => {
        if (!storeId || !vendorId) return
        setCreating(true)
        createOrderMutation.mutate({
            storeId,
            vendorId,
            vendorType: vendorType ?? "market_vendor",
        })
    }, [storeId, vendorId, vendorType])

    // Convert amount in PAISE (from backend) to RUPEES for visual display
    const amountInRupees = orderData ? orderData.amount / 100 : 0

    // ── Handle Razorpay Payment ───────────────────────────────────────────────
    const handleRazorpayPayment = async () => {
        if (!orderData || !vendorId || !storeId) return

        const res = await loadRazorpayScript()
        if (!res) {
            toast.error("Razorpay SDK failed to load. Are you online?")
            return
        }

        const options = {
            key: orderData.keyId,
            amount: orderData.amount, // amount in PAISE from backend
            currency: "INR",
            name: "ROS Registration",
            description: "Store Registration Fee",
            order_id: orderData.orderId,
            handler: function (response: any) {
                // Verify payment signature securely on backend
                verifyMutation.mutate({
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                    storeId,
                    vendorId,
                })
            },
            prefill: {
                name: orderData.vendorName || "Store Vendor",
                contact: orderData.vendorContact || "",
            },
            theme: {
                color: "#135B47",
            },
        }

        const paymentObject = new window.Razorpay(options)
        paymentObject.on("payment.failed", function (response: any) {
            toast.error("Payment Failed: " + response.error.description)
            navigate(
                `/payment-status/${vendorId}/${storeId}?status=failed&orderId=${orderData.orderId}${typeParam}`,
            )
        })
        paymentObject.open()
    }

    const handleCashConfirm = () => {
        toast.success("Cash payment recorded")
        navigate(
            `/payment-status/${vendorId}/${storeId}?status=success&method=cash&orderId=${orderData?.orderId || ""}${typeParam}`,
        )
    }

    const handleSkipConfirm = () => {
        if (!skipNote.trim()) {
            toast.error("Please enter a reason for skipping payment")
            return
        }
        if (!vendorId || !storeId) return
        skipMutation.mutate({
            storeId,
            vendorId,
            vendorType: vendorType ?? "market_vendor",
            note: skipNote.trim(),
        })
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#F5F6F8] font-sans text-gray-900">
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 pt-12 pb-4 md:px-8 md:pt-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-200"
                    >
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </button>
                    <h1 className="text-[18px] font-bold tracking-tight md:text-xl">
                        Registration Amount
                    </h1>
                </div>

                {/* Content Card */}
                <div className="mx-5 mt-2 flex flex-col items-center gap-4 rounded-[20px] bg-white p-6 shadow-sm md:mx-8">
                    {creating && !orderData ? (
                        <div className="py-10 text-sm text-gray-400">Creating payment order…</div>
                    ) : (
                        <>
                            <div className="flex flex-col items-center">
                                <p className="text-sm font-medium text-gray-400">Total Amount</p>
                                <p className="text-[32px] font-bold tracking-tight text-gray-900">
                                    ₹ {amountInRupees.toLocaleString("en-IN")}
                                </p>
                            </div>

                            {mode === "online" ? (
                                <div className="flex w-full flex-col items-center gap-4 py-6">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F3F0]">
                                        <svg
                                            width="32"
                                            height="32"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#135B47"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <rect
                                                x="3"
                                                y="11"
                                                width="18"
                                                height="11"
                                                rx="2"
                                                ry="2"
                                            ></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                    </div>
                                    <p className="text-center text-sm text-gray-500">
                                        Proceed to pay ₹{amountInRupees.toLocaleString("en-IN")}{" "}
                                        securely via Razorpay
                                    </p>
                                    <button
                                        onClick={handleRazorpayPayment}
                                        disabled={!orderData || verifyMutation.isPending}
                                        className="w-full rounded-[14px] bg-[#135B47] py-4 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0f4d3c] disabled:opacity-50"
                                    >
                                        {verifyMutation.isPending
                                            ? "Verifying..."
                                            : "Pay via Razorpay"}
                                    </button>
                                </div>
                            ) : mode === "cash" ? (
                                <div className="flex w-full flex-col items-center gap-4 py-6">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F3F0]">
                                        <svg
                                            width="32"
                                            height="32"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#135B47"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <rect x="2" y="6" width="20" height="12" rx="2" />
                                            <circle cx="12" cy="12" r="2" />
                                        </svg>
                                    </div>
                                    <p className="text-center text-sm text-gray-500">
                                        Collect ₹{amountInRupees.toLocaleString("en-IN")} in cash
                                        <br />
                                        and confirm below
                                    </p>
                                    <button
                                        onClick={handleCashConfirm}
                                        disabled={!orderData}
                                        className="w-full rounded-[14px] bg-[black] py-4 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        Confirm Cash Received
                                    </button>
                                </div>
                            ) : (
                                <div className="flex w-full flex-col items-center gap-4 py-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF3C7]">
                                        <svg
                                            width="32"
                                            height="32"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#D97706"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </div>
                                    <p className="text-center text-sm text-gray-500">
                                        Mark subscription charge as pending and state the reason
                                        below
                                    </p>
                                    <textarea
                                        rows={3}
                                        placeholder="Reason for skipping payment (e.g. Approved by Super Admin, Deferred payment)"
                                        value={skipNote}
                                        onChange={(e) => setSkipNote(e.target.value)}
                                        className="w-full rounded-[14px] border border-gray-200 p-3 text-sm text-gray-800 focus:border-[#135B47] focus:outline-none"
                                    />
                                    <button
                                        onClick={handleSkipConfirm}
                                        disabled={skipMutation.isPending || !skipNote.trim()}
                                        className="w-full rounded-[14px] bg-[#D97706] py-4 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#b46305] disabled:opacity-50"
                                    >
                                        {skipMutation.isPending
                                            ? "Saving..."
                                            : "Confirm Skip Payment (Mark Pending)"}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Payment Mode Selector */}
                <div className="mx-5 mt-6">
                    <p className="mb-3 text-[13px] font-semibold text-gray-500">
                        Select Payment Mode
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => setMode("online")}
                            className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-4 transition-all ${mode === "online" ? "border-[#135B47] shadow-sm" : "border-transparent shadow-sm"}`}
                        >
                            <div
                                className={`flex h-9 w-9 items-center justify-center rounded-full ${mode === "online" ? "bg-[#E8F3F0]" : "bg-gray-100"}`}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke={mode === "online" ? "#135B47" : "#888"}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                                    <line x1="2" y1="10" x2="22" y2="10"></line>
                                </svg>
                            </div>
                            <span
                                className={`text-[15px] font-semibold ${mode === "online" ? "text-[#135B47]" : "text-gray-700"}`}
                            >
                                Online Payment
                            </span>
                        </button>

                        <button
                            onClick={() => setMode("cash")}
                            className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-4 transition-all ${mode === "cash" ? "border-[#135B47]" : "border-transparent shadow-sm"}`}
                        >
                            <div
                                className={`flex h-9 w-9 items-center justify-center rounded-full ${mode === "cash" ? "bg-[#E8F3F0]" : "bg-gray-100"}`}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke={mode === "cash" ? "#135B47" : "#888"}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="2" y="6" width="20" height="12" rx="2" />
                                    <circle cx="12" cy="12" r="2" />
                                </svg>
                            </div>
                            <span
                                className={`text-[15px] font-semibold ${mode === "cash" ? "text-[#135B47]" : "text-gray-700"}`}
                            >
                                Cash
                            </span>
                        </button>

                        <button
                            onClick={() => setMode("skip")}
                            className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-4 transition-all ${mode === "skip" ? "border-[#D97706] shadow-sm" : "border-transparent shadow-sm"}`}
                        >
                            <div
                                className={`flex h-9 w-9 items-center justify-center rounded-full ${mode === "skip" ? "bg-[#FEF3C7]" : "bg-gray-100"}`}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke={mode === "skip" ? "#D97706" : "#888"}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <span
                                className={`text-[15px] font-semibold ${mode === "skip" ? "text-[#D97706]" : "text-gray-700"}`}
                            >
                                Skip Payment (Mark Pending)
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="pb-28" />
        </div>
    )
}
