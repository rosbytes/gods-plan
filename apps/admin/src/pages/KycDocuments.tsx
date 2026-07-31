import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { customFetch } from "../lib/customFetch"
import { parseVendorType } from "../constants/vendor"
import { toast } from "sonner"

type IdType = "aadhar" | "pan"

export default function KycDocuments() {
    const navigate = useNavigate()
    const { vendorId, storeId } = useParams<{ vendorId: string; storeId: string }>()

    const [idType, setIdType] = useState<IdType>("aadhar")
    const [idNumber, setIdNumber] = useState("")

    const [frontUrl, setFrontUrl] = useState("")
    const [backUrl, setBackUrl] = useState("")
    const [storefrontUrl, setStorefrontUrl] = useState("")

    const [uploading, setUploading] = useState<{ [key: string]: boolean }>({})

    const saveKyc = trpc.store.saveKyc.useMutation({
        onSuccess: () => navigate(`/success/${vendorId}/${storeId}`),
        onError: (e) => alert(e.message),
    })

    const isFormValid =
        idNumber.trim().length >= 10 &&
        frontUrl &&
        backUrl &&
        storefrontUrl &&
        !Object.values(uploading).some((v) => v)

    const handleFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "front" | "back" | "storefront",
    ) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading((prev) => ({ ...prev, [field]: true }))

        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await customFetch(`${import.meta.env.VITE_API_URL}/api/media/upload`, {
                method: "POST",
                body: formData,
            })

            const data = await response.json()
            if (data.success) {
                if (field === "front") setFrontUrl(data.url)
                if (field === "back") setBackUrl(data.url)
                if (field === "storefront") setStorefrontUrl(data.url)
                toast.success("File uploaded successfully")
            } else {
                toast.error(data.message || "Upload failed")
            }
        } catch (error) {
            console.error("Upload error:", error)
            toast.error("Upload failed. Please check server connection.")
        } finally {
            setUploading((prev) => ({ ...prev, [field]: false }))
        }
    }

    const handleContinue = async () => {
        if (!vendorId || !storeId || !vendorType) return

        try {
            if (vendorType === "market_vendor") {
                const res = await Promise.all([
                    saveMarketKyc.mutateAsync({
                        vendorId,
                        storeId,
                        docType: idType,
                        docId: idNumber,
                        frontUrl,
                        backUrl,
                        storefrontUrl,
                    }),
                    updateMarketStore.mutateAsync({
                        storeId,
                        storeImage: storefrontUrl,
                    }),
                ])
                if (res.every((item) => item.success)) {
                    toast.success("KYC details saved successfully")
                    navigate(`/success/${vendorId}/${storeId}${typeParam}`)
                }
            } else if (vendorType === "mandi_vendor") {
                const res = await Promise.all([
                    saveMandiKyc.mutateAsync({
                        vendorId,
                        storeId,
                        docType: idType,
                        docId: idNumber,
                        frontUrl,
                        backUrl,
                        storefrontUrl,
                    }),
                    updateMandiStore.mutateAsync({
                        storeId,
                        storeImage: storefrontUrl,
                    }),
                ])
                if (res.every((item) => item.success)) {
                    toast.success("KYC details saved successfully")
                    navigate(`/success/${vendorId}/${storeId}${typeParam}`)
                }
            }
        } catch (e: any) {
            console.error("KYC submission error:", e)
            toast.error(e.message || "Failed to save KYC details")
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#F5F6F8] pb-28 font-sans text-gray-900">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 pt-12 pb-4">
                <button
                    onClick={() => navigate(-1)}
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
                <h1 className="text-[18px] font-bold tracking-tight">KYC Documents</h1>
            </div>

            <div className="mt-2 flex-1 space-y-6 overflow-y-auto px-5">
                {/* ID Type */}
                <div className="space-y-3">
                    <p className="text-[14px] font-medium text-gray-500">ID Type</p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIdType("aadhar")}
                            className={`flex-1 rounded-[18px] border-2 py-4 text-[15px] font-semibold transition-all ${idType === "aadhar" ? "border-[#135B47] bg-white text-[#135B47]" : "border-transparent bg-white text-gray-400"}`}
                        >
                            Aadhar
                        </button>
                        <button
                            onClick={() => setIdType("pan")}
                            className={`flex-1 rounded-[18px] border-2 py-4 text-[15px] font-semibold transition-all ${idType === "pan" ? "border-[#135B47] bg-white text-[#135B47]" : "border-transparent bg-white text-gray-400"}`}
                        >
                            PAN
                        </button>
                    </div>
                </div>

                {/* ID Number */}
                <div className="overflow-hidden rounded-[18px] bg-white px-5 pt-4 pb-4 shadow-sm">
                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                        ID Number
                    </label>
                    <input
                        type="text"
                        placeholder="Write Here"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        className="w-full bg-transparent text-[16px] font-bold text-gray-800 placeholder-gray-300 focus:outline-none"
                    />
                </div>

                {/* Upload ID Section */}
                <div className="space-y-3">
                    <p className="text-[14px] font-medium text-gray-500">Upload ID</p>
                    <div className="flex gap-4">
                        {/* Front Image */}
                        <label className="relative flex aspect-[1.3/1] flex-1 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-[18px] border-2 border-dashed border-gray-200 bg-white">
                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, "front")}
                                accept="image/*"
                            />
                            {frontUrl ? (
                                <img
                                    src={frontUrl}
                                    className="h-full w-full object-cover"
                                    alt="ID Front"
                                />
                            ) : (
                                <div className="flex flex-col items-center text-gray-400">
                                    <p className="text-[14px] font-semibold">Front</p>
                                </div>
                            )}
                            {uploading.front && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#135B47] border-t-transparent"></div>
                                </div>
                            )}
                            {!frontUrl && !uploading.front && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/5 p-2">
                                    <div className="rounded-full bg-white/90 p-2 shadow-sm">
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#135B47"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </label>

                        {/* Back Image */}
                        <label className="relative flex aspect-[1.3/1] flex-1 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-[18px] border-2 border-dashed border-gray-200 bg-white">
                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, "back")}
                                accept="image/*"
                            />
                            {backUrl ? (
                                <img
                                    src={backUrl}
                                    className="h-full w-full object-cover"
                                    alt="ID Back"
                                />
                            ) : (
                                <div className="flex flex-col items-center text-gray-400">
                                    <p className="text-[14px] font-semibold">Back</p>
                                </div>
                            )}
                            {uploading.back && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#135B47] border-t-transparent"></div>
                                </div>
                            )}
                            {!backUrl && !uploading.back && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/5 p-2">
                                    <div className="rounded-full bg-white/90 p-2 shadow-sm">
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#135B47"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </label>
                    </div>
                </div>

                {/* Store Front Photo */}
                <div className="space-y-3">
                    <p className="text-[14px] font-medium text-gray-500">Upload Store Photo</p>
                    <label className="relative flex aspect-2/1 w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-[18px] border-2 border-dashed border-gray-200 bg-white">
                        <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "storefront")}
                            accept="image/*"
                        />
                        {storefrontUrl ? (
                            <img
                                src={storefrontUrl}
                                className="h-full w-full object-cover"
                                alt="Store Front"
                            />
                        ) : null}
                        {uploading.storefront && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                                <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#135B47] border-t-transparent"></div>
                            </div>
                        )}
                        {!storefrontUrl && !uploading.storefront && (
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                <div className="rounded-full bg-white/90 p-3 shadow-md">
                                    <svg
                                        width="28"
                                        height="28"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#135B47"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                        <circle cx="12" cy="13" r="4"></circle>
                                    </svg>
                                </div>
                            </div>
                        )}
                    </label>
                </div>
            </div>

            {/* Continue Button */}
            {isFormValid && (
                <div className="fixed bottom-0 left-0 z-30 w-full bg-linear-to-t from-[#F5F6F8] via-[#F5F6F8] to-transparent px-5 py-6">
                    <button
                        onClick={handleContinue}
                        disabled={saveKyc.isPending}
                        className="flex w-full items-center justify-center rounded-[18px] bg-[#135B47] py-[18px] text-[16px] font-semibold text-white shadow-md transition-colors hover:bg-[#0f4d3c] disabled:opacity-60"
                    >
                        {saveKyc.isPending ? "Saving..." : "Continue"}
                    </button>
                </div>
            )}
        </div>
    )
}
