import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { toast } from "sonner"
import { parseVendorType } from "../constants/vendor"

export default function CreateStore() {
    const navigate = useNavigate()
    const { vendorId } = useParams<{ vendorId: string }>()

    const [storeName, setStoreName] = useState("")
    const [fullAddress, setFullAddress] = useState("")
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [locationLabel, setLocationLabel] = useState("Tap to add location")
    const [isFetchingLocation, setIsFetchingLocation] = useState(false)

    const saveMutation = trpc.store.saveStore.useMutation({
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
        saveMutation.mutate(
            {
                vendorId,
                storeName,
                fullAddress,
                lat: location.lat,
                lng: location.lng,
            },
            {
                onSuccess: (data) => {
                    navigate(`/kyc/${vendorId}/${data.store.id}`)
                },
            },
        )
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
                <h1 className="text-[18px] font-bold tracking-tight">Store Details</h1>
            </div>

            <div className="mt-2 flex-1 space-y-4 px-5">
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
                    className="flex w-full items-center gap-4 rounded-[18px] bg-white px-5 py-4 text-left shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-60"
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
                        <p className="text-[15px] font-semibold text-gray-800">Store location</p>
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
            </div>

            {/* Continue Button — only appears when form is valid */}
            {isFormValid && (
                <div className="fixed bottom-0 left-0 z-30 w-full bg-linear-to-t from-[#F5F6F8] via-[#F5F6F8] to-transparent px-5 py-6">
                    <button
                        onClick={handleContinue}
                        disabled={saveMutation.isPending}
                        className="flex w-full items-center justify-center rounded-[18px] bg-[#135B47] py-[18px] text-[16px] font-semibold text-white shadow-md transition-colors hover:bg-[#0f4d3c] disabled:opacity-60"
                    >
                        {saveMutation.isPending ? "Saving..." : "Continue"}
                    </button>
                </div>
            )}
        </div>
    )
}
