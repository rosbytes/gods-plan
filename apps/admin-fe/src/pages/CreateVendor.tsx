import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"

type VendorType = "market_vendor" | "mandi_vendor"

export default function CreateVendor() {
    const navigate = useNavigate()

    const [vendorType, setVendorType] = useState<VendorType>("market_vendor")
    const [fullName, setFullName] = useState("")
    const [mobileNumber, setMobileNumber] = useState("")
    const [alternateNumber, setAlternateNumber] = useState("")

    const createMutation = trpc.vendor.create.useMutation({
        onSuccess: (data) => {
            // Redirect to create store for this specific vendor
            navigate(`/create-store/${data.vendor.id}`)
        },
        onError: (e) => alert(e.message),
    })

    const isFormValid = fullName.trim() !== "" && mobileNumber.trim() !== ""

    const handleContinue = () => {
        createMutation.mutate({
            fullName,
            primaryPhone: mobileNumber,
            alternatePhone: alternateNumber || undefined,
            type: vendorType,
        })
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#F5F6F8] pb-28 font-sans text-gray-900">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 pt-12 pb-4">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="rounded-full p-1 transition-colors hover:bg-gray-100"
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
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <h1 className="text-[18px] font-bold tracking-tight">Vendor Details</h1>
            </div>

            <div className="mt-2 flex-1 space-y-6 px-5">
                {/* Vendor Type */}
                <div>
                    <p className="mb-3 text-[14px] font-medium text-gray-500">Vendor Type</p>
                    <div className="grid grid-cols-2 gap-3">
                        {/* Market */}
                        <button
                            onClick={() => setVendorType("market_vendor")}
                            className={`flex items-center gap-3 rounded-[16px] border-2 px-4 py-4 text-left text-[15px] font-semibold transition-all ${
                                vendorType === "market_vendor"
                                    ? "border-[#135B47] bg-white text-[#135B47]"
                                    : "border-gray-200 bg-white text-gray-600"
                            }`}
                        >
                            <span
                                className={`flex h-8 w-8 items-center justify-center rounded-lg text-2xl ${vendorType === "market_vendor" ? "bg-[#E8F3F0]" : "bg-gray-100"}`}
                            >
                                🏪
                            </span>
                            Market
                        </button>

                        {/* Mandi */}
                        <button
                            onClick={() => setVendorType("mandi_vendor")}
                            className={`flex items-center gap-3 rounded-[16px] border-2 px-4 py-4 text-left text-[15px] font-semibold transition-all ${
                                vendorType === "mandi_vendor"
                                    ? "border-[#135B47] bg-white text-[#135B47]"
                                    : "border-gray-200 bg-white text-gray-600"
                            }`}
                        >
                            <span
                                className={`flex h-8 w-8 items-center justify-center rounded-lg text-2xl ${vendorType === "mandi_vendor" ? "bg-[#E8F3F0]" : "bg-gray-100"}`}
                            >
                                🚜
                            </span>
                            Mandi
                        </button>
                    </div>
                </div>

                {/* Basic Details */}
                <div>
                    <p className="mb-3 text-[14px] font-medium text-gray-500">Basic Details</p>
                    <div className="divide-y divide-gray-100 overflow-hidden rounded-[18px] bg-white shadow-sm">
                        {/* Full Name */}
                        <div className="px-5 pt-4 pb-4">
                            <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="Write Here"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                            />
                        </div>

                        {/* Mobile Number */}
                        <div className="px-5 pt-4 pb-4">
                            <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                Mobile Number
                            </label>
                            <input
                                type="tel"
                                placeholder="Write Here"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                            />
                        </div>

                        {/* Alternate Number */}
                        <div className="px-5 pt-4 pb-4">
                            <div className="flex items-start justify-between">
                                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                    Alternate Number
                                </label>
                                <span className="text-xs font-medium text-gray-400">Optional</span>
                            </div>
                            <input
                                type="tel"
                                placeholder="Write Here"
                                value={alternateNumber}
                                onChange={(e) => setAlternateNumber(e.target.value)}
                                className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Continue Button — only shows when form is valid */}
            {isFormValid && (
                <div className="fixed bottom-0 left-0 z-30 w-full bg-gradient-to-t from-[#F5F6F8] via-[#F5F6F8] to-transparent px-5 py-6">
                    <button
                        onClick={handleContinue}
                        disabled={createMutation.isPending}
                        className="flex w-full items-center justify-center rounded-[18px] bg-[#135B47] py-[18px] text-[16px] font-semibold text-white shadow-md transition-colors hover:bg-[#0f4d3c] disabled:opacity-60"
                    >
                        {createMutation.isPending ? "Saving..." : "Continue"}
                    </button>
                </div>
            )}
        </div>
    )
}
