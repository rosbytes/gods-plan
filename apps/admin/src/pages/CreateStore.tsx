import { useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { toast } from "sonner"
import { parseVendorType } from "../constants/vendor"

export default function CreateStore() {
    const mandilist = trpc.mandi.listAllMandi.useQuery()
    const veglists = trpc.veg.getAll.useQuery()

    const navigate = useNavigate()
    const { vendorId } = useParams<{ vendorId: string }>()
    const [searchParams] = useSearchParams()
    const vendorType = parseVendorType(searchParams.get("type"))

    const [storeName, setStoreName] = useState("")
    const [fullAddress, setFullAddress] = useState("")
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [locationLabel, setLocationLabel] = useState("Tap to add location")
    const [isFetchingLocation, setIsFetchingLocation] = useState(false)
    const [mandiId, setMandiId] = useState<string>()
    const [vegId, setVegId] = useState<string>()

    const marketStoreMutation = trpc.store.createMarketStore.useMutation({
        onSuccess: () => navigate("/dashboard"),
        onError: (e) => toast.error(e.message),
    })

    const mandiStoreMutation = trpc.store.createMandiStore.useMutation({
        onSuccess: () => navigate("/dashboard"),
        onError: (e) => toast.error(e.message),
    })

    const isFormValid = storeName.trim() !== "" && fullAddress.trim() !== "" && location !== null

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
                setLocationLabel(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
                setIsFetchingLocation(false)
            },
            () => {
                // fallback to Jaipur coords for dev
                const lat = 26.8373
                const lng = 75.836
                setLocation({ lat, lng })
                setLocationLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
                setIsFetchingLocation(false)
            },
            { timeout: 8000 },
        )
    }

    const handleContinue = () => {
        if (!location || !vendorId) return
        if (vendorType === "mandi_vendor") {
            mandiStoreMutation.mutate(
                {
                    vendorId,
                    mandiId: mandiId!,
                    vegId: vegId!,
                    storeName,
                    fullAddress,
                    lat: location.lat,
                    lng: location.lng,
                },
                {
                    onSuccess: (data) => {
                        const typeParam = vendorType ? `?type=${vendorType}` : ""
                        navigate(`/kyc/${vendorId}/${data.store.id}${typeParam}`)
                    },
                },
            )
        } else if (vendorType === "market_vendor") {
            marketStoreMutation.mutate(
                {
                    vendorId,
                    mandiId: mandiId!,
                    storeName,
                    fullAddress,
                    lat: location.lat,
                    lng: location.lng,
                },
                {
                    onSuccess: (data) => {
                        const typeParam = vendorType ? `?type=${vendorType}` : ""
                        navigate(`/kyc/${vendorId}/${data.store.id}${typeParam}`)
                    },
                },
            )
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#F5F6F8] pb-28 font-sans text-gray-900">
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
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <h1 className="text-[18px] font-bold tracking-tight md:text-xl">
                        Store Details
                    </h1>
                </div>

                <div className="mt-2 flex-1 space-y-4 px-5 md:px-8">
                    <p className="text-[14px] font-medium text-gray-500">Store Details</p>

                    {/* Store Name */}
                    <div className="overflow-hidden rounded-[18px] bg-white shadow-sm">
                        <div className="px-5 pt-4 pb-4">
                            <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                Store Name
                            </label>
                            <input
                                type="text"
                                placeholder="Write Here"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Store Location */}
                    <button
                        onClick={handleGetLocation}
                        disabled={isFetchingLocation}
                        className="flex w-full cursor-pointer items-center gap-4 rounded-[18px] bg-white px-5 py-4 text-left shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-60"
                    >
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${location ? "bg-[#135B47]" : "bg-[#E8F3F0]"}`}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={location ? "white" : "#135B47"}
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </div>
                        <div>
                            <p className="text-[15px] font-semibold text-gray-800">
                                Store location
                            </p>
                            <p
                                className={`mt-0.5 text-[13px] ${location ? "font-medium text-[#135B47]" : "text-gray-400"}`}
                            >
                                {isFetchingLocation ? "Fetching location..." : locationLabel}
                            </p>
                        </div>
                    </button>

                    {/* Full Address */}
                    <div className="overflow-hidden rounded-[18px] bg-white shadow-sm">
                        <div className="px-5 pt-4 pb-4">
                            <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                Full Address
                            </label>
                            <input
                                type="text"
                                placeholder="Write Here"
                                value={fullAddress}
                                onChange={(e) => setFullAddress(e.target.value)}
                                className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Mandi */}
                    <select
                        value={mandiId}
                        onChange={(e) => setMandiId(e.target.value)}
                        className="bg-right-4 w-full cursor-pointer appearance-none rounded-2xl border border-gray-200 bg-white bg-[url('/down-arrow.svg')] bg-no-repeat p-4 pr-10 shadow-sm placeholder:text-[16px] placeholder:font-medium focus:outline-none"
                    >
                        <option value="">Select Mandi</option>
                        {mandilist.data?.map((mandi) => (
                            <option key={mandi.id} value={mandi.id}>
                                {mandi.name}
                            </option>
                        ))}
                    </select>

                    {/* Veg */}
                    {vendorType === "mandi_vendor" && (
                        <select
                            value={vegId}
                            onChange={(e) => setVegId(e.target.value)}
                            className="bg-right-4 w-full cursor-pointer appearance-none rounded-2xl border border-gray-200 bg-white bg-[url('/down-arrow.svg')] bg-no-repeat p-4 pr-10 shadow-sm placeholder:text-[16px] placeholder:font-medium focus:outline-none"
                        >
                            <option value="">Select Veg</option>
                            {veglists.data?.map((veg) => (
                                <option key={veg.id} value={veg.id}>
                                    {veg.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Continue Button — only appears when form is valid */}
            {isFormValid && (
                <div className="fixed bottom-0 left-0 z-30 w-full bg-linear-to-t from-[#F5F6F8] via-[#F5F6F8] to-transparent px-5 py-6 md:left-1/2 md:max-w-2xl md:-translate-x-1/2 md:px-8">
                    <button
                        onClick={handleContinue}
                        disabled={
                            vendorType === "mandi_vendor"
                                ? mandiStoreMutation.isPending
                                : marketStoreMutation.isPending
                        }
                        className="flex w-full cursor-pointer items-center justify-center rounded-[18px] bg-[#135B47] py-4.5 text-[16px] font-semibold text-white shadow-md transition-colors hover:bg-[#0f4d3c] disabled:opacity-60"
                    >
                        {vendorType === "mandi_vendor"
                            ? mandiStoreMutation.isPending
                                ? "Saving..."
                                : "Continue"
                            : marketStoreMutation.isPending
                              ? "Saving..."
                              : "Continue"}
                    </button>
                </div>
            )}
        </div>
    )
}
