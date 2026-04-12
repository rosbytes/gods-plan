import { useNavigate, useParams, useSearchParams } from "react-router-dom"

export default function PaymentSuccess() {
    const navigate = useNavigate()
    const { vendorId, storeId } = useParams<{ vendorId: string; storeId: string }>()
    const [searchParams] = useSearchParams()
    const method = searchParams.get("method") ?? "UPI QR"

    const now = new Date()
    const formattedDate =
        now.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }) +
        " | " +
        now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })

    const txnId = Math.floor(Math.random() * 9000000000 + 1000000000).toString()

    return (
        <div className="flex min-h-screen flex-col items-center bg-[#F5F6F8] pb-32 font-sans">
            {/* Success Section */}
            <div className="flex flex-col items-center px-6 pt-20 pb-8 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#6CC091] shadow-lg">
                    <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>

                <p className="text-[28px] font-bold tracking-tight text-gray-900">₹ 5,000</p>
                <p className="mt-1 text-[17px] font-semibold text-gray-700">Payment Successful</p>
            </div>

            {/* Payment Details Card */}
            <div className="mx-5 w-full max-w-md rounded-[20px] bg-white px-5 py-4 shadow-sm">
                <p className="mb-4 text-[14px] font-bold text-gray-900">Payment Details</p>

                <div className="flex flex-col gap-3 text-[14px] text-gray-700">
                    <p>
                        To: <span className="font-medium">ROS@ybl</span>
                    </p>
                    <p>
                        From: <span className="font-medium">Admin</span>
                    </p>
                    <div className="flex items-center justify-between">
                        <p>
                            Transaction ID: <span className="font-medium">{txnId}</span>
                        </p>
                        <button
                            onClick={() => navigator.clipboard.writeText(txnId)}
                            className="ml-2 text-gray-400 transition-colors hover:text-gray-600"
                            title="Copy"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="9" y="9" width="13" height="13" rx="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                        </button>
                    </div>
                    <p>
                        Payment Method:{" "}
                        <span className="font-medium capitalize">
                            {method === "cash" ? "Cash" : "UPI QR"}
                        </span>
                    </p>
                    <p>
                        Date: <span className="font-medium">{formattedDate}</span>
                    </p>
                </div>
            </div>

            {/* Continue Button */}
            <div className="fixed bottom-0 left-0 w-full bg-linear-to-t from-[#F5F6F8] via-[#F5F6F8] to-transparent px-5 py-6">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full rounded-[18px] bg-[#135B47] py-[18px] text-[16px] font-semibold text-white shadow-md transition-colors hover:bg-[#0f4d3c]"
                >
                    Continue
                </button>
            </div>
        </div>
    )
}
