import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { toast } from "sonner"
import { VendorType } from "../constants/vendor"
import { AdminLayout } from "../components/layout"
import { Input, Button, PageHeader, BackIcon } from "../components/ui"

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
        <>
            {/* ========================================================================= */}
            {/* MOBILE VIEW (< 1024px) — 100% PRESERVED ORIGINAL MOBILE DESIGN            */}
            {/* ========================================================================= */}
            <div className="flex min-h-screen flex-col bg-[#F5F6F8] pb-28 font-sans text-gray-900 lg:hidden">
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-5 pt-12 pb-4">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-200"
                        >
                            <BackIcon size={22} />
                        </button>
                        <h1 className="text-[18px] font-bold tracking-tight">Vendor Details</h1>
                    </div>

                    <div className="mt-2 flex-1 space-y-6 px-5">
                        {/* Vendor Type Selection */}
                        <div>
                            <p className="mb-3 text-[14px] font-medium text-gray-500">
                                Vendor Type
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setVendorType(VendorType.MARKET_VENDOR)}
                                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-[15px] font-semibold transition-all ${
                                        vendorType === VendorType.MARKET_VENDOR
                                            ? "border-[#135B47] bg-white text-[#135B47]"
                                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-2xl ${
                                            vendorType === VendorType.MARKET_VENDOR
                                                ? "bg-[#E8F3F0]"
                                                : "bg-gray-100"
                                        }`}
                                    >
                                        🏪
                                    </span>
                                    Market
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setVendorType(VendorType.MANDI_VENDOR)}
                                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-[15px] font-semibold transition-all ${
                                        vendorType === VendorType.MANDI_VENDOR
                                            ? "border-[#135B47] bg-white text-[#135B47]"
                                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-2xl ${
                                            vendorType === VendorType.MANDI_VENDOR
                                                ? "bg-[#E8F3F0]"
                                                : "bg-gray-100"
                                        }`}
                                    >
                                        🥬
                                    </span>
                                    Mandi
                                </button>
                            </div>
                        </div>

                        {/* Form Inputs */}
                        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                            <Input
                                label="Full Name *"
                                placeholder="Enter vendor's full name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                            <Input
                                label="Mobile Number *"
                                type="tel"
                                placeholder="Enter 10-digit mobile number"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                            />
                            <Input
                                label="Alternate Number (Optional)"
                                type="tel"
                                placeholder="Enter secondary contact number"
                                value={alternateNumber}
                                onChange={(e) => setAlternateNumber(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Floating Bottom Action Button */}
                {isFormValid && (
                    <div className="fixed bottom-0 left-0 z-30 w-full bg-linear-to-t from-[#F5F6F8] via-[#F5F6F8] to-transparent px-5 py-6">
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

            {/* ========================================================================= */}
            {/* DESKTOP VIEW (>= 1024px) — ELEVATED DESKTOP DASHBOARD                      */}
            {/* ========================================================================= */}
            <div className="hidden lg:block">
                <AdminLayout
                    title="Register Vendor"
                    subtitle="Step 1 of 4: Primary profile information"
                >
                    <div className="mx-auto max-w-2xl">
                        {/* Onboarding Wizard Progress Bar */}
                        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-500">
                                <span className="font-bold text-[#135B47]">
                                    Step 1: Vendor Info
                                </span>
                                <span>Step 2: Store Setup</span>
                                <span>Step 3: KYC</span>
                                <span>Step 4: Payment</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                <div className="h-full w-1/4 rounded-full bg-[#135B47] transition-all" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Vendor Type Selection */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                    Select Vendor Category *
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setVendorType(VendorType.MARKET_VENDOR)}
                                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left transition-all ${
                                            vendorType === VendorType.MARKET_VENDOR
                                                ? "border-[#135B47] bg-white text-[#135B47] shadow-sm"
                                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                        }`}
                                    >
                                        <span
                                            className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${
                                                vendorType === VendorType.MARKET_VENDOR
                                                    ? "bg-emerald-50"
                                                    : "bg-gray-100"
                                            }`}
                                        >
                                            🏪
                                        </span>
                                        <div>
                                            <div className="text-sm font-bold">Market Vendor</div>
                                            <div className="text-xs font-medium text-gray-400">
                                                Retail store merchant
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setVendorType(VendorType.MANDI_VENDOR)}
                                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left transition-all ${
                                            vendorType === VendorType.MANDI_VENDOR
                                                ? "border-[#135B47] bg-white text-[#135B47] shadow-sm"
                                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                        }`}
                                    >
                                        <span
                                            className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${
                                                vendorType === VendorType.MANDI_VENDOR
                                                    ? "bg-emerald-50"
                                                    : "bg-gray-100"
                                            }`}
                                        >
                                            🥬
                                        </span>
                                        <div>
                                            <div className="text-sm font-bold">Mandi Vendor</div>
                                            <div className="text-xs font-medium text-gray-400">
                                                Wholesale merchant
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Form Inputs Container */}
                            <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                                <h3 className="border-b border-gray-100 pb-3 text-sm font-bold text-gray-800">
                                    Personal Details
                                </h3>
                                <Input
                                    label="Full Name *"
                                    placeholder="Enter vendor's full legal name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                                <Input
                                    label="Mobile Number *"
                                    type="tel"
                                    placeholder="Enter 10-digit primary phone"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                />
                                <Input
                                    label="Alternate Number (Optional)"
                                    type="tel"
                                    placeholder="Enter secondary contact phone"
                                    value={alternateNumber}
                                    onChange={(e) => setAlternateNumber(e.target.value)}
                                />

                                <div className="flex justify-end pt-4">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        isLoading={isPending}
                                        disabled={!isFormValid}
                                        onClick={handleContinue}
                                    >
                                        Save & Continue to Store Setup →
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </AdminLayout>
            </div>
        </>
    )
}
