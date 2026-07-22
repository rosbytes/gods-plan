import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { formatTransactionDate } from "@/libs/utils"

type TransactionStatus = "processing" | "success" | "failed"

function simulateTransactionResult(): Promise<TransactionStatus> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(Math.random() > 0.5 ? "success" : "failed"), 1000)
    })
}

export default function TransactionPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState<TransactionStatus>("processing")
    const [copied, setCopied] = useState(false)

    const vendorId = searchParams.get("vendorId") || ""
    const vendorName = searchParams.get("vendorName") || "Unknown Vendor"
    const totalBill = searchParams.get("totalBill") || "0"
    const quantity = searchParams.get("quantity") || "0"
    const paymentMethod = searchParams.get("paymentMethod") || "UPI QR"
    const [transactionId] = useState(() => `${vendorId}${Date.now().toString().slice(-6)}`)

    const details = {
        to: "ROS@ybl",
        from: "9028465360@UPI",
        transactionId,
        paymentMethod,
        date: formatTransactionDate(),
        amount: `₹ ${totalBill}`,
    }

    useEffect(() => {
        simulateTransactionResult().then((result) => {
            setStatus(result)
        })
    }, [])

    const handleCopyId = () => {
        navigator.clipboard.writeText(details.transactionId).catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const statusConfig = {
        processing: { bg: "bg-[#FE5D27]", label: "Payment In Process", btnLabel: null },
        success: { bg: "bg-[#59AC77]", label: "Payment Successful", btnLabel: "Payment Received" },
        failed: { bg: "bg-[#E21931]", label: "Payment Failed", btnLabel: "Back to payment" },
    }
    const cfg = statusConfig[status]

    return (
        <>
            <style>{`
                @keyframes scaleIn { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.12); } 100% { transform: scale(1); opacity: 1; } }
                @keyframes pulsate { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.8; } }
                @keyframes bounceDot { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
                .icon-scale-in { animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
                .icon-pulsate { animation: pulsate 1.4s ease-in-out infinite; }
                .dot1 { animation: bounceDot 1.2s ease-in-out infinite 0ms; }
                .dot2 { animation: bounceDot 1.2s ease-in-out infinite 150ms; }
                .dot3 { animation: bounceDot 1.2s ease-in-out infinite 300ms; }
            `}</style>

            <div className="mx-auto flex min-h-screen max-w-103 flex-col bg-[#F2F3F6] pb-10">
                <div className="h-12 w-full shrink-0 bg-[#F2F3F6]" />

                <div className="flex flex-col items-center gap-4 px-5 pt-9 pb-2">
                    <div
                        className={`h-20 w-20 rounded-full ${cfg.bg} flex items-center justify-center ${status === "processing" ? "icon-pulsate" : "icon-scale-in"}`}
                    >
                        {status === "success" && (
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M5 12l5 5L19 7"
                                    stroke="#F2F3F6"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        )}
                        {status === "failed" && (
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M6 6l12 12M18 6L6 18"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        )}
                        {status === "processing" && (
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
                                <path
                                    d="M12 7v5l3 3"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        )}
                    </div>
                    <p className="text-[28px] leading-8 font-bold text-[#000000]">
                        {details.amount}
                    </p>
                    <p className="text-5 text-center leading-6 font-bold text-[#444444]">
                        {cfg.label}
                    </p>
                    {status === "processing" && (
                        <div className="mt-1 flex items-center gap-1.5">
                            <span className="dot1 inline-block h-2 w-2 rounded-full bg-[#FE5D27]" />
                            <span className="dot2 inline-block h-2 w-2 rounded-full bg-[#FE5D27]" />
                            <span className="dot3 inline-block h-2 w-2 rounded-full bg-[#FE5D27]" />
                        </div>
                    )}
                </div>

                <div className="mt-6 px-5">
                    <p className="mb-3 text-[18px] font-semibold text-[#444444]">Payment Details</p>
                    <div className="rounded-3 flex w-full flex-col gap-5 bg-white px-5 py-5">
                        <p className="text-[18px] leading-5.5 font-normal text-[#444444]">
                            To: {details.to}
                        </p>
                        <p className="text-[18px] leading-5.5 font-normal text-[#444444]">
                            From: {details.from}
                        </p>
                        <div className="flex items-center justify-between">
                            <p className="text-[18px] leading-5.5 font-normal text-[#444444]">
                                Transaction ID: {details.transactionId}
                            </p>
                            <button
                                onClick={handleCopyId}
                                className="ml-2 shrink-0 cursor-pointer border-none bg-transparent transition-opacity active:opacity-50"
                                title="Copy Transaction ID"
                            >
                                {copied ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M5 12l5 5L19 7"
                                            stroke="#59AC77"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <rect
                                            x="9"
                                            y="9"
                                            width="13"
                                            height="13"
                                            rx="2"
                                            stroke="#444444"
                                            strokeWidth="1.8"
                                        />
                                        <path
                                            d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                                            stroke="#444444"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="text-[18px] leading-5.5 font-normal text-[#444444]">
                            Payment Method: {details.paymentMethod}
                        </p>
                        <p className="text-[18px] leading-5.5 font-normal text-[#444444]">
                            Date: {details.date}
                        </p>
                    </div>
                </div>

                <div className="mt-auto px-5 pt-8">
                    {status !== "processing" && (
                        <button
                            onClick={() => {
                                if (status === "failed") {
                                    const qp = new URLSearchParams({
                                        vendorId,
                                        vendorName,
                                        totalBill,
                                        quantity,
                                    }).toString()
                                    navigate(`/payment?${qp}`)
                                } else {
                                    navigate("/")
                                }
                            }}
                            className="text-5 icon-scale-in h-12.5 w-full cursor-pointer rounded-[25px] border-none bg-[#0A5445] font-bold tracking-wide text-white transition-opacity active:opacity-80"
                        >
                            {cfg.btnLabel}
                        </button>
                    )}
                </div>
            </div>
        </>
    )
}
