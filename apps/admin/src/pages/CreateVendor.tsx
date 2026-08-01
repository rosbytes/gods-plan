import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { toast } from "sonner"
import { VendorType } from "../constants/vendor"
import { PageHeader, Input, Button } from "../components/ui"

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
        <div className="min-h-screen bg-[#F5F6F8] pb-28 font-sans text-gray-900">
            <PageHeader
                title="Vendor Details"
                subtitle="Step 1 of 4: Enter primary vendor profile"
                onBack={() => navigate("/dashboard")}
            />

            <main className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">
                <div className="space-y-6">
                    {/* Vendor Type Selection */}
                    <div>
                        <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
                            Vendor Type
                        </label>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <button
                                type="button"
                                onClick={() => setVendorType(VendorType.MARKET_VENDOR)}
                                className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-[15px] font-semibold transition-all ${
                                    vendorType === VendorType.MARKET_VENDOR
                                        ? "border-[#135B47] bg-white text-[#135B47] shadow-xs"
                                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                }`}
                            >
                                <span
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${
                                        vendorType === VendorType.MARKET_VENDOR
                                            ? "bg-emerald-50"
                                            : "bg-gray-100"
                                    }`}
                                >
                                    🏪
                                </span>
                                <div>
                                    <div className="font-bold">Market</div>
                                    <div className="text-xs font-normal text-gray-400">
                                        Retail vendor
                                    </div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setVendorType(VendorType.MANDI_VENDOR)}
                                className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-[15px] font-semibold transition-all ${
                                    vendorType === VendorType.MANDI_VENDOR
                                        ? "border-[#135B47] bg-white text-[#135B47] shadow-xs"
                                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                }`}
                            >
                                <span
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${
                                        vendorType === VendorType.MANDI_VENDOR
                                            ? "bg-emerald-50"
                                            : "bg-gray-100"
                                    }`}
                                >
                                    🥬
                                </span>
                                <div>
                                    <div className="font-bold">Mandi</div>
                                    <div className="text-xs font-normal text-gray-400">
                                        Wholesale vendor
                                    </div>
                                </div>
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
            </main>

            {/* Action Footer */}
            {isFormValid && (
                <div className="fixed bottom-0 left-0 z-30 w-full bg-linear-to-t from-[#F5F6F8] via-[#F5F6F8]/80 to-transparent px-5 py-6 md:left-1/2 md:max-w-2xl md:-translate-x-1/2 md:px-8">
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        isLoading={isPending}
                        onClick={handleContinue}
                    >
                        Continue
                    </Button>
                </div>
            )}
        </div>
    )
}
