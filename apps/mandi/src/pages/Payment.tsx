import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

type PaymentMode = "upi" | "cash"

export default function PaymentPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [selected, setSelected] = useState<PaymentMode>("upi")

    const vendorId = searchParams.get("vendorId") || ""
    const vendorName = searchParams.get("vendorName") || "Unknown Vendor"
    const totalBill = searchParams.get("totalBill") || "0"
    const quantity = searchParams.get("quantity") || "0"

    const handleCTA = () => {
        if (selected === "upi") {
            const queryParams = new URLSearchParams({
                vendorId,
                vendorName,
                totalBill,
                quantity,
                paymentMethod: "UPI QR",
            }).toString()
            navigate(`/transaction?${queryParams}`)
        } else {
            navigate("/")
        }
    }

    return (
        <div className="mx-auto flex min-h-screen max-w-103 flex-col bg-[#F2F3F6] px-5 pb-10">
            <div className="flex h-22 shrink-0 items-center gap-3 pt-12 pb-2">
                <button onClick={() => navigate("/")} className="flex items-center p-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M19 12H5M5 12L12 19M5 12L12 5"
                            stroke="#111"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
                <span className="text-[17px] font-semibold text-[#111111]">Total Amount</span>
            </div>

            <div className="flex w-full shrink-0 flex-col items-center gap-3 rounded-2xl bg-white py-8">
                <p className="text-[13px] font-normal text-gray-400">{vendorName}</p>
                <p className="text-[32px] leading-none font-bold text-[#111111]">₹ {totalBill}</p>
                <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=rosmandi@upi&am=${totalBill}`}
                    alt="QR Code"
                    width={180}
                    height={180}
                    className="mt-1"
                />
                <p className="text-[13px] text-gray-400">Scan & Pay</p>
            </div>

            <div className="mt-4 flex w-full flex-col">
                <p className="mb-3 text-[15px] font-semibold text-[#111111]">Select Payment Mode</p>
                <button
                    onClick={() => setSelected("upi")}
                    className={`mb-2 flex h-16 w-full items-center gap-3 rounded-xl border-[1.5px] bg-white px-4 transition-colors ${
                        selected === "upi" ? "border-[#0A5445]" : "border-transparent"
                    }`}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <rect
                            x="3"
                            y="3"
                            width="7"
                            height="7"
                            rx="1"
                            stroke={selected === "upi" ? "#0A5445" : "#888"}
                            strokeWidth="1.8"
                        />
                        <rect
                            x="14"
                            y="3"
                            width="7"
                            height="7"
                            rx="1"
                            stroke={selected === "upi" ? "#0A5445" : "#888"}
                            strokeWidth="1.8"
                        />
                        <rect
                            x="3"
                            y="14"
                            width="7"
                            height="7"
                            rx="1"
                            stroke={selected === "upi" ? "#0A5445" : "#888"}
                            strokeWidth="1.8"
                        />
                        <rect
                            x="5"
                            y="5"
                            width="3"
                            height="3"
                            fill={selected === "upi" ? "#0A5445" : "#888"}
                        />
                        <rect
                            x="16"
                            y="5"
                            width="3"
                            height="3"
                            fill={selected === "upi" ? "#0A5445" : "#888"}
                        />
                        <rect
                            x="5"
                            y="16"
                            width="3"
                            height="3"
                            fill={selected === "upi" ? "#0A5445" : "#888"}
                        />
                        <path
                            d="M14 14h2v2h-2zM16 16h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"
                            fill={selected === "upi" ? "#0A5445" : "#888"}
                        />
                    </svg>
                    <span
                        className={`text-[15px] font-medium ${selected === "upi" ? "text-[#0A5445]" : "text-[#111111]"}`}
                    >
                        UPI QR
                    </span>
                </button>

                <button
                    onClick={() => setSelected("cash")}
                    className={`flex h-16 w-full items-center gap-3 rounded-xl border-[1.5px] bg-white px-4 transition-colors ${
                        selected === "cash" ? "border-[#0A5445]" : "border-transparent"
                    }`}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <rect
                            x="2"
                            y="6"
                            width="20"
                            height="13"
                            rx="2"
                            stroke={selected === "cash" ? "#0A5445" : "#888"}
                            strokeWidth="1.8"
                        />
                        <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke={selected === "cash" ? "#0A5445" : "#888"}
                            strokeWidth="1.8"
                        />
                        <path
                            d="M6 9v6M18 9v6"
                            stroke={selected === "cash" ? "#0A5445" : "#888"}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                    <span
                        className={`text-[15px] font-medium ${selected === "cash" ? "text-[#0A5445]" : "text-[#111111]"}`}
                    >
                        Cash
                    </span>
                </button>
            </div>

            <div className="mt-auto pt-8">
                <button
                    onClick={handleCTA}
                    className="h-12.5 w-full rounded-[25px] bg-[#0A5445] text-[16px] font-semibold tracking-wide text-white transition-opacity active:opacity-80"
                >
                    {selected === "upi" ? "Refresh" : "Payment Received"}
                </button>
            </div>
        </div>
    )
}
