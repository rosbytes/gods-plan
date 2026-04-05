import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { trpc } from "../lib/trpc"

export default function StoreDetails() {
    const navigate = useNavigate()
    const { vendorId } = useParams<{ vendorId: string }>()

    const [storeName, setStoreName] = useState("")
    const [fullAddress, setFullAddress] = useState("")
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [isFetchingLocation, setIsFetchingLocation] = useState(false)
    const [locationLabel, setLocationLabel] = useState("Tap to add location")

    const saveMutation = trpc.store.saveStore.useMutation({
        onSuccess: (data) => navigate(`/kyc/${vendorId}/${data.store.id}`),
        onError: (e: any) => alert(e.message),
    })

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported")
            return
        }
        setIsFetchingLocation(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords
                setLocation({ lat: latitude, lng: longitude })
                setLocationLabel(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
                setIsFetchingLocation(false)
            },
            () => {
                alert("Could not fetch location")
                setIsFetchingLocation(false)
            },
        )
    }

    const handleContinue = () => {
        if (!vendorId || !location) {
            alert("Please provide location")
            return
        }
        saveMutation.mutate({
            vendorId,
            storeName,
            fullAddress,
            lat: location.lat,
            lng: location.lng,
        })
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#F5F6F8] font-sans text-gray-900">
            {/* Header */}
            <div className="flex items-center px-4 pt-12 pb-6">
                <button className="mr-4" onClick={() => navigate(-1)}>
                    {/* Simple back icon */}
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
            <div className="flex flex-1 flex-col px-4">
                <h2 className="mb-4 px-1 text-sm font-semibold text-gray-500">Store Details</h2>

                <div className="flex flex-col gap-4">
                    {/* Store Name Input */}
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                        <label className="mb-1 block text-xs font-medium text-gray-400">
                            Store Name
                        </label>
                        <input
                            type="text"
                            className="w-full text-base font-semibold placeholder-gray-800 focus:outline-none"
                            placeholder="Write Here"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                        />
                    </div>

                    {/* Store Location */}
                    <button
                        onClick={handleGetLocation}
                        disabled={isFetchingLocation}
                        className="flex w-full items-center rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-60"
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
                            <span className="text-[15px] font-semibold">Store location</span>
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
                            className="w-full text-base font-semibold placeholder-gray-800 focus:outline-none"
                            placeholder="Write Here"
                            value={fullAddress}
                            onChange={(e) => setFullAddress(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Button */}
            <div className="px-4 pt-4 pb-8">
                <button
                    onClick={handleContinue}
                    className="w-full rounded-xl bg-[#135B47] py-4 text-base font-semibold text-white shadow-sm"
                >
                    Continue
                </button>
            </div>
        </div>
    )
}
