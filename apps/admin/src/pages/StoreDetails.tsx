import { useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { toast } from "sonner"
import { parseVendorType } from "../constants/vendor"

export default function StoreDetails() {
    const navigate = useNavigate()
    const { vendorId } = useParams<{ vendorId: string }>()
    const [searchParams] = useSearchParams()
    const vendorType = parseVendorType(searchParams.get("type"))
    const typeParam = vendorType ? `?type=${vendorType}` : ""

    const mandiListQuery = trpc.mandi.listAllMandi.useQuery()
    const vegListQuery = trpc.veg.getAll.useQuery(undefined, {
        enabled: vendorType === "mandi_vendor",
    })

    const [storeName, setStoreName] = useState("")
    const [fullAddress, setFullAddress] = useState("")
    const [mandiId, setMandiId] = useState("")
    const [vegId, setVegId] = useState("")
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [isFetchingLocation, setIsFetchingLocation] = useState(false)
    const [locationLabel, setLocationLabel] = useState("Tap to add location")

    const saveMutation = trpc.store.saveStore.useMutation({
        onSuccess: (data) => {
            toast.success("Store details saved successfully")
            navigate(`/kyc/${vendorId}/${data.store.id}${typeParam}`)
        },
        onError: (e: any) => toast.error(e.message || "Failed to save store"),
    })

    const createMarketStoreMutation = trpc.store.createMarketStore.useMutation({
        onSuccess: (data) => {
            toast.success("Market store created successfully")
            navigate(`/kyc/${vendorId}/${data.store.id}${typeParam}`)
        },
        onError: (e: any) => toast.error(e.message || "Failed to create market store"),
    })

    const createMandiStoreMutation = trpc.store.createMandiStore.useMutation({
        onSuccess: (data) => {
            toast.success("Mandi store created successfully")
            navigate(`/kyc/${vendorId}/${data.store.id}${typeParam}`)
        },
        onError: (e: any) => toast.error(e.message || "Failed to create mandi store"),
    })

    const isPending =
        saveMutation.isPending ||
        createMarketStoreMutation.isPending ||
        createMandiStoreMutation.isPending

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser")
            return
        }
        setIsFetchingLocation(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords
                setLocation({ lat: latitude, lng: longitude })
                setLocationLabel(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
                setIsFetchingLocation(false)
                toast.success("Location fetched successfully")
            },
            (error) => {
                toast.error(error.message || "Could not fetch location")
                setIsFetchingLocation(false)
            },
            { timeout: 10000 },
        )
    }

    const handleContinue = () => {
        if (!vendorId) {
            toast.error("Invalid vendor ID")
            return
        }
        if (!storeName.trim()) {
            toast.error("Please enter store name")
            return
        }
        if (!mandiId) {
            toast.error("Please select a Mandi")
            return
        }
        if (vendorType === "mandi_vendor" && !vegId) {
            toast.error("Please select a Vegetable")
            return
        }
        if (!location) {
            toast.error("Please provide store location")
            return
        }
        if (!fullAddress.trim()) {
            toast.error("Please enter full address")
            return
        }

        if (vendorType === "mandi_vendor") {
            createMandiStoreMutation.mutate({
                vendorId,
                mandiId,
                vegId,
                storeName: storeName.trim(),
                fullAddress: fullAddress.trim(),
                lat: location.lat,
                lng: location.lng,
            })
        } else if (vendorType === "market_vendor") {
            createMarketStoreMutation.mutate({
                vendorId,
                mandiId,
                storeName: storeName.trim(),
                fullAddress: fullAddress.trim(),
                lat: location.lat,
                lng: location.lng,
            })
        } else {
            saveMutation.mutate({
                vendorId,
                mandiId,
                storeName: storeName.trim(),
                fullAddress: fullAddress.trim(),
                lat: location.lat,
                lng: location.lng,
            })
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#F5F6F8] font-sans text-gray-900">
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
                {/* Header */}
                <div className="flex items-center px-4 pt-12 pb-6 md:px-8 md:pt-8">
                    <button
                        className="mr-4 cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-200"
                        onClick={() => navigate(-1)}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold">Store Details</h1>
                </div>

                {/* Form */}
                <div className="flex flex-1 flex-col px-4 pb-28 md:px-8">
                    <h2 className="mb-4 px-1 text-sm font-semibold text-gray-500">
                        Fill Store Information
                    </h2>

                    <div className="flex flex-col gap-4">
                        {/* Store Name Input */}
                        <div className="rounded-xl bg-white p-4 shadow-sm">
                            <label className="mb-1 block text-xs font-medium text-gray-400">
                                Store Name
                            </label>
                            <input
                                type="text"
                                className="w-full text-base font-semibold placeholder-gray-400 focus:outline-none"
                                placeholder="Enter store name"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                            />
                        </div>

                        {/* Select Mandi Dropdown */}
                        <div className="rounded-xl bg-white p-4 shadow-sm">
                            <label className="mb-1 block text-xs font-medium text-gray-400">
                                Select Mandi
                            </label>
                            <select
                                value={mandiId}
                                onChange={(e) => setMandiId(e.target.value)}
                                className="w-full cursor-pointer bg-transparent text-base font-semibold text-gray-800 focus:outline-none"
                            >
                                <option value="">
                                    {mandiListQuery.isLoading
                                        ? "Loading Mandis..."
                                        : "Select Mandi"}
                                </option>
                                {mandiListQuery.data?.map((mandi) => (
                                    <option key={mandi.id} value={mandi.id}>
                                        {mandi.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Select Vegetable Dropdown (Mandi Vendor Only) */}
                        {vendorType === "mandi_vendor" && (
                            <div className="rounded-xl bg-white p-4 shadow-sm">
                                <label className="mb-1 block text-xs font-medium text-gray-400">
                                    Select Vegetable
                                </label>
                                <select
                                    value={vegId}
                                    onChange={(e) => setVegId(e.target.value)}
                                    className="w-full cursor-pointer bg-transparent text-base font-semibold text-gray-800 focus:outline-none"
                                >
                                    <option value="">
                                        {vegListQuery.isLoading
                                            ? "Loading Vegetables..."
                                            : "Select Vegetable"}
                                    </option>
                                    {vegListQuery.data?.map((veg) => (
                                        <option key={veg.id} value={veg.id}>
                                            {veg.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Store Location */}
                        <button
                            type="button"
                            onClick={handleGetLocation}
                            disabled={isFetchingLocation}
                            className="flex w-full cursor-pointer items-center rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-60"
                        >
                            <div
                                className={`mr-3 rounded-full p-2 ${location ? "bg-[#135B47] text-white" : "bg-[#E7EFEB] text-[#135B47]"}`}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[15px] font-semibold">Store Location</span>
                                <span
                                    className={`mt-0.5 text-xs ${location ? "font-medium text-[#135B47]" : "text-gray-400"}`}
                                >
                                    {isFetchingLocation ? "Fetching..." : locationLabel}
                                </span>
                            </div>
                        </button>

                        {/* Full Address */}
                        <div className="rounded-xl bg-white p-4 shadow-sm">
                            <label className="mb-1 block text-xs font-medium text-gray-400">
                                Full Address
                            </label>
                            <input
                                type="text"
                                className="w-full text-base font-semibold placeholder-gray-400 focus:outline-none"
                                placeholder="Enter full store address"
                                value={fullAddress}
                                onChange={(e) => setFullAddress(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Button */}
            <div className="fixed bottom-0 left-0 w-full bg-linear-to-t from-[#F5F6F8] via-[#F5F6F8] to-transparent px-4 pt-4 pb-8 md:left-1/2 md:max-w-2xl md:-translate-x-1/2 md:px-8">
                <button
                    type="button"
                    onClick={handleContinue}
                    disabled={isPending}
                    className="w-full cursor-pointer rounded-xl bg-[#135B47] py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#0f4d3c] disabled:opacity-60"
                >
                    {isPending ? "Saving..." : "Continue"}
                </button>
            </div>
        </div>
    )
}
