import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { toast } from "sonner"
import { VendorType } from "../constants/vendor"

export default function CreateVendor() {
    const navigate = useNavigate()

    const [vendorType, setVendorType] = useState<VendorType>(VendorType.MARKET_VENDOR)
    const [fullName, setFullName] = useState("")
    const [mobileNumber, setMobileNumber] = useState("")
    const [alternateNumber, setAlternateNumber] = useState("")

    const createMarketMutation = trpc.vendor.createMarket.useMutation({
        onSuccess: (data) => {
            toast.success("Vendor created successfully")
            navigate(`/create-store/${data.vendor.id}?type=${vendorType}`)
        },
        onError: (e) => toast.error(e.message),
    })

    const createMandiMutation = trpc.vendor.createMandi.useMutation({
        onSuccess: (data) => {
            toast.success("Vendor created successfully")
            navigate(`/create-store/${data.vendor.id}?type=${vendorType}`)
        },
        onError: (e) => toast.error(e.message),
    })

    const isFormValid = fullName.trim() !== "" && mobileNumber.trim() !== ""
    const isPending = createMarketMutation.isPending || createMandiMutation.isPending

    const handleContinue = () => {
        const payload = {
            fullName,
            primaryPhone: mobileNumber,
            alternatePhone: alternateNumber || undefined,
        }

        if (vendorType === VendorType.MARKET_VENDOR) {
            createMarketMutation.mutate(payload)
        } else {
            createMandiMutation.mutate(payload)
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#F5F6F8] pb-28 font-sans text-gray-900">
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 pt-12 pb-4 md:px-8 md:pt-8">
                    <button
                        onClick={() => navigate("/dashboard")}
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
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <h1 className="text-[18px] font-bold tracking-tight md:text-xl">
                        Vendor Details
                    </h1>
                </div>

                <div className="mt-2 flex-1 space-y-6 px-5 md:px-8">
                    {/* Vendor Type */}
                    <div>
                        <p className="mb-3 text-[14px] font-medium text-gray-500">Vendor Type</p>
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            {/* Market */}
                            <button
                                onClick={() => setVendorType(VendorType.MARKET_VENDOR)}
                                className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-[15px] font-semibold transition-all ${
                                    vendorType === VendorType.MARKET_VENDOR
                                        ? "border-[#135B47] bg-white text-[#135B47]"
                                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                }`}
                            >
                                <span
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-2xl ${vendorType === VendorType.MARKET_VENDOR ? "bg-[#E8F3F0]" : "bg-gray-100"}`}
                                >
                                    🏪
                                </span>
                                Market
                            </button>

                            {/* Mandi */}
                            <button
                                onClick={() => setVendorType(VendorType.MANDI_VENDOR)}
                                className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-[15px] font-semibold transition-all ${
                                    vendorType === VendorType.MANDI_VENDOR
                                        ? "border-[#135B47] bg-white text-[#135B47]"
                                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                }`}
                            >
                                <span
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-2xl ${vendorType === VendorType.MANDI_VENDOR ? "bg-[#E8F3F0]" : "bg-gray-100"}`}
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
                                    <span className="text-xs font-medium text-gray-400">
                                        Optional
                                    </span>
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
            </div>

            {/* Continue Button — only shows when form is valid */}
            {isFormValid && (
                <div className="fixed bottom-0 left-0 z-30 w-full bg-linear-to-t from-[#F5F6F8] via-[#F5F6F8] to-transparent px-5 py-6 md:left-1/2 md:max-w-2xl md:-translate-x-1/2 md:px-8">
                    <button
                        onClick={handleContinue}
                        disabled={isPending}
                        className="flex w-full cursor-pointer items-center justify-center rounded-[18px] bg-[#135B47] py-4.5 text-[16px] font-semibold text-white shadow-md transition-colors hover:bg-[#0f4d3c] disabled:opacity-60"
                    >
                        {isPending ? "Saving..." : "Continue"}
                    </button>
                </div>
            )}
        </div>
    )
}
