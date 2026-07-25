import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"

export default function ManageMandis() {
    const navigate = useNavigate()
    const [showForm, setShowForm] = useState(false)

    // Form state
    const [name, setName] = useState("")
    const [cityId, setCityId] = useState("")
    const [lat, setLat] = useState("")
    const [lng, setLng] = useState("")
    const [fullAddress, setFullAddress] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [isFetchingLocation, setIsFetchingLocation] = useState(false)

    const { data: mandis, isLoading, refetch } = trpc.mandi.list.useQuery({})
    const { data: cities } = trpc.city.list.useQuery({})

    const createMutation = trpc.mandi.create.useMutation({
        onSuccess: () => {
            setName("")
            setCityId("")
            setLat("")
            setLng("")
            setFullAddress("")
            setImageFile(null)
            setShowForm(false)
            refetch()
        },
        onError: (e) => alert(e.message),
    })

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser")
            return
        }
        setIsFetchingLocation(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLat(pos.coords.latitude.toFixed(6))
                setLng(pos.coords.longitude.toFixed(6))
                setIsFetchingLocation(false)
            },
            () => {
                // fallback to Jaipur coords for dev
                setLat("26.837300")
                setLng("75.836000")
                setIsFetchingLocation(false)
            },
            { timeout: 8000 },
        )
    }

    const handleSubmit = async () => {
        let mandiImage: string | undefined
        if (imageFile) {
            setUploading(true)
            try {
                const formData = new FormData()
                formData.append("file", imageFile)
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/media/upload`, {
                    method: "POST",
                    body: formData,
                })
                const data = await res.json()
                if (data.success) mandiImage = data.url
            } catch {
                alert("Image upload failed")
            }
            setUploading(false)
        }

        createMutation.mutate({
            name,
            cityId,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            fullAddress: fullAddress || undefined,
            mandiImage,
        })
    }

    const isFormValid = name.trim() !== "" && cityId !== "" && lat !== "" && lng !== ""
    const isPending = createMutation.isPending || uploading

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
                <h1 className="text-[18px] font-bold tracking-tight">Manage Mandis</h1>
            </div>

            <div className="mt-2 flex-1 space-y-5 px-5">
                {/* Create Form Toggle */}
                {!showForm ? (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-gray-300 bg-white py-4 text-[15px] font-semibold text-gray-500 transition-colors hover:border-[#135B47] hover:text-[#135B47]"
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
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add New Mandi
                    </button>
                ) : (
                    <div className="divide-y divide-gray-100 overflow-hidden rounded-[18px] bg-white shadow-sm">
                        <div className="bg-[#135B47] px-5 py-3.5">
                            <h2 className="text-[15px] font-semibold text-white">New Mandi</h2>
                        </div>

                        {/* Mandi Name */}
                        <div className="px-5 pt-4 pb-4">
                            <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                Mandi Name *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Muhana Mandi"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                            />
                        </div>

                        {/* City Select */}
                        <div className="px-5 pt-4 pb-4">
                            <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                City *
                            </label>
                            <select
                                value={cityId}
                                onChange={(e) => setCityId(e.target.value)}
                                className="w-full appearance-none bg-transparent text-[16px] font-semibold text-gray-800 focus:outline-none"
                            >
                                <option value="">Select a city</option>
                                {cities?.items?.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}, {c.state}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Location */}
                        <div className="px-5 pt-4 pb-4">
                            <label className="mb-2 block text-xs font-medium text-gray-400">
                                Location *
                            </label>
                            <button
                                onClick={handleGetLocation}
                                disabled={isFetchingLocation}
                                className="mb-3 flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-[#135B47] hover:text-[#135B47] disabled:opacity-60"
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                {isFetchingLocation
                                    ? "Fetching..."
                                    : lat
                                      ? `📍 ${lat}, ${lng}`
                                      : "Use current location"}
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-400">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="26.8373"
                                        value={lat}
                                        onChange={(e) => setLat(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-[14px] font-semibold text-gray-800 placeholder-gray-300 focus:border-[#135B47] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-400">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="75.836"
                                        value={lng}
                                        onChange={(e) => setLng(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-[14px] font-semibold text-gray-800 placeholder-gray-300 focus:border-[#135B47] focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Full Address */}
                        <div className="px-5 pt-4 pb-4">
                            <div className="flex items-start justify-between">
                                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                    Full Address
                                </label>
                                <span className="text-xs font-medium text-gray-400">Optional</span>
                            </div>
                            <input
                                type="text"
                                placeholder="e.g. Near NH-48, Muhana"
                                value={fullAddress}
                                onChange={(e) => setFullAddress(e.target.value)}
                                className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="px-5 pt-4 pb-4">
                            <div className="flex items-start justify-between">
                                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                    Mandi Image
                                </label>
                                <span className="text-xs font-medium text-gray-400">Optional</span>
                            </div>
                            <label className="mt-1 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-[#135B47] hover:text-[#135B47]">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                                {imageFile ? imageFile.name : "Choose image"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                                />
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 px-5 py-4">
                            <button
                                onClick={() => setShowForm(false)}
                                className="flex-1 rounded-xl bg-gray-100 py-3 text-[14px] font-semibold text-gray-600 transition-colors hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!isFormValid || isPending}
                                className="flex-1 rounded-xl bg-[#135B47] py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#0f4d3c] disabled:opacity-60"
                            >
                                {isPending ? "Saving..." : "Create Mandi"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Mandis List */}
                <div>
                    <p className="mb-3 text-[14px] font-semibold text-gray-500">
                        All Mandis {mandis?.items && `(${mandis.items.length})`}
                    </p>

                    {isLoading ? (
                        <div className="mt-10 flex justify-center text-gray-400">Loading...</div>
                    ) : mandis?.items?.length === 0 ? (
                        <div className="mt-10 text-center text-sm text-gray-400">
                            No mandis added yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {mandis?.items?.map((m) => (
                                <div
                                    key={m.id}
                                    className="flex items-center gap-4 rounded-2xl border border-gray-50 bg-white p-4.5 shadow-sm"
                                >
                                    {/* Mandi Image or Placeholder */}
                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#E8F3F0]">
                                        {m.mandiImage ? (
                                            <img
                                                src={m.mandiImage}
                                                alt={m.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xl">
                                                🏪
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[16px] font-bold tracking-tight text-gray-800">
                                            {m.name}
                                        </span>
                                        <span className="mt-0.5 text-[13px] font-medium text-gray-400">
                                            {m.city?.name}, {m.city?.state}
                                            {m.fullAddress ? ` • ${m.fullAddress}` : ""}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
