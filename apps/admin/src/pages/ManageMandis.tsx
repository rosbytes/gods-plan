import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { customFetch } from "../lib/customFetch"

type MandiItem = {
    id: string
    name: string
    cityId: string
    lat: number
    lng: number
    fullAddress: string | null
    mandiImage: string | null
    city?: { id: string; name: string; state: string } | null
}

export default function ManageMandis() {
    const navigate = useNavigate()
    const [showForm, setShowForm] = useState(false)

    // Create form state
    const [name, setName] = useState("")
    const [cityId, setCityId] = useState("")
    const [lat, setLat] = useState("")
    const [lng, setLng] = useState("")
    const [fullAddress, setFullAddress] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [isFetchingLocation, setIsFetchingLocation] = useState(false)

    const { data: mandis, isLoading, refetch } = trpc.mandi.list.useQuery({})
    // Edit state
    const [editingMandi, setEditingMandi] = useState<MandiItem | null>(null)
    const [editName, setEditName] = useState("")
    const [editCityId, setEditCityId] = useState("")
    const [editLat, setEditLat] = useState("")
    const [editLng, setEditLng] = useState("")
    const [editFullAddress, setEditFullAddress] = useState("")
    const [editImageFile, setEditImageFile] = useState<File | null>(null)

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

    const updateMutation = trpc.mandi.update.useMutation({
        onSuccess: () => {
            setEditingMandi(null)
            setEditImageFile(null)
            refetch()
        },
        onError: (e) => alert(e.message),
    })

    const uploadImage = async (file: File): Promise<string | undefined> => {
        try {
            const formData = new FormData()
            formData.append("file", file)
            const res = await customFetch(`${import.meta.env.VITE_API_URL}/api/media/upload`, {
                method: "POST",
                body: formData,
            })
            const data = await res.json()
            if (data.success) return data.url
            alert(`Upload failed: ${data.message || "Unknown error"}`)
        } catch {
            alert("Image upload failed — network error")
        }
        return undefined
    }

    const handleGetLocation = (isEdit = false) => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser")
            return
        }
        setIsFetchingLocation(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const latVal = pos.coords.latitude.toFixed(6)
                const lngVal = pos.coords.longitude.toFixed(6)
                if (isEdit) {
                    setEditLat(latVal)
                    setEditLng(lngVal)
                } else {
                    setLat(latVal)
                    setLng(lngVal)
                }
                setIsFetchingLocation(false)
            },
            () => {
                if (isEdit) {
                    setEditLat("26.837300")
                    setEditLng("75.836000")
                } else {
                    setLat("26.837300")
                    setLng("75.836000")
                }
                setIsFetchingLocation(false)
            },
            { timeout: 8000 },
        )
    }

    const handleSubmit = async () => {
        let mandiImage: string | undefined
        if (imageFile) {
            setUploading(true)
            mandiImage = await uploadImage(imageFile)
            setUploading(false)
        }
        if (!mandiImage) return

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
    const handleEdit = (m: MandiItem) => {
        setEditingMandi(m)
        setEditName(m.name)
        setEditCityId(m.cityId)
        setEditLat(String(m.lat))
        setEditLng(String(m.lng))
        setEditFullAddress(m.fullAddress || "")
        setEditImageFile(null)
    }

    const handleUpdate = async () => {
        if (!editingMandi) return

        let mandiImage: string | undefined
        if (editImageFile) {
            setUploading(true)
            mandiImage = await uploadImage(editImageFile)
            setUploading(false)
            if (!mandiImage) return
        }

        updateMutation.mutate({
            id: editingMandi.id,
            name: editName !== editingMandi.name ? editName : undefined,
            cityId: editCityId !== editingMandi.cityId ? editCityId : undefined,
            lat: parseFloat(editLat) !== editingMandi.lat ? parseFloat(editLat) : undefined,
            lng: parseFloat(editLng) !== editingMandi.lng ? parseFloat(editLng) : undefined,
            fullAddress:
                editFullAddress !== (editingMandi.fullAddress || "")
                    ? editFullAddress || undefined
                    : undefined,
            mandiImage,
        })
    }

    const isEditValid =
        editName.trim() !== "" && editCityId !== "" && editLat !== "" && editLng !== ""
    const isPending = createMutation.isPending || updateMutation.isPending || uploading

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
                {/* Create Form */}
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
                        <div className="px-5 pt-4 pb-4">
                            <label className="mb-2 block text-xs font-medium text-gray-400">
                                Location *
                            </label>
                            <button
                                onClick={() => handleGetLocation(false)}
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
                            {mandis?.items?.map((m) =>
                                editingMandi?.id === m.id ? (
                                    /* ---- EDIT FORM ---- */
                                    <div
                                        key={m.id}
                                        className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm"
                                    >
                                        <div className="bg-[#0f4d3c] px-5 py-3">
                                            <h3 className="text-[14px] font-semibold text-white">
                                                Edit Mandi
                                            </h3>
                                        </div>
                                        <div className="px-5 pt-3.5 pb-3.5">
                                            <label className="mb-1 block text-xs font-medium text-gray-400">
                                                Mandi Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full bg-transparent text-[15px] font-semibold text-gray-800 focus:outline-none"
                                            />
                                        </div>
                                        <div className="px-5 pt-3.5 pb-3.5">
                                            <label className="mb-1 block text-xs font-medium text-gray-400">
                                                City *
                                            </label>
                                            <select
                                                value={editCityId}
                                                onChange={(e) => setEditCityId(e.target.value)}
                                                className="w-full appearance-none bg-transparent text-[15px] font-semibold text-gray-800 focus:outline-none"
                                            >
                                                <option value="">Select a city</option>
                                                {cities?.items?.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}, {c.state}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="px-5 pt-3.5 pb-3.5">
                                            <label className="mb-1 block text-xs font-medium text-gray-400">
                                                Location *
                                            </label>
                                            <button
                                                onClick={() => handleGetLocation(true)}
                                                disabled={isFetchingLocation}
                                                className="mb-2 flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:border-[#135B47]"
                                            >
                                                📍{" "}
                                                {isFetchingLocation
                                                    ? "Fetching..."
                                                    : "Use current location"}
                                            </button>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={editLat}
                                                    onChange={(e) => setEditLat(e.target.value)}
                                                    className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-[14px] font-semibold text-gray-800 focus:border-[#135B47] focus:outline-none"
                                                />
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={editLng}
                                                    onChange={(e) => setEditLng(e.target.value)}
                                                    className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-[14px] font-semibold text-gray-800 focus:border-[#135B47] focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="px-5 pt-3.5 pb-3.5">
                                            <label className="mb-1 block text-xs font-medium text-gray-400">
                                                Full Address
                                            </label>
                                            <input
                                                type="text"
                                                value={editFullAddress}
                                                onChange={(e) => setEditFullAddress(e.target.value)}
                                                className="w-full bg-transparent text-[15px] font-semibold text-gray-800 focus:outline-none"
                                            />
                                        </div>
                                        <div className="px-5 pt-3.5 pb-3.5">
                                            <label className="mb-1 block text-xs font-medium text-gray-400">
                                                Update Image
                                            </label>
                                            <label className="mt-1 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:border-[#135B47] hover:text-[#135B47]">
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <rect
                                                        x="3"
                                                        y="3"
                                                        width="18"
                                                        height="18"
                                                        rx="2"
                                                        ry="2"
                                                    ></rect>
                                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                    <polyline points="21 15 16 10 5 21"></polyline>
                                                </svg>
                                                {editImageFile
                                                    ? editImageFile.name
                                                    : "Choose new image"}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) =>
                                                        setEditImageFile(
                                                            e.target.files?.[0] ?? null,
                                                        )
                                                    }
                                                />
                                            </label>
                                        </div>
                                        <div className="flex gap-3 px-5 py-3.5">
                                            <button
                                                onClick={() => setEditingMandi(null)}
                                                className="flex-1 rounded-xl bg-gray-100 py-2.5 text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-200"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleUpdate}
                                                disabled={!isEditValid || isPending}
                                                className="flex-1 rounded-xl bg-[#135B47] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#0f4d3c] disabled:opacity-60"
                                            >
                                                {isPending ? "Saving..." : "Save Changes"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* ---- DISPLAY CARD ---- */
                                    <div
                                        key={m.id}
                                        className="flex items-center gap-4 rounded-2xl border border-gray-50 bg-white p-4.5 shadow-sm"
                                    >
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
                                        <div className="flex flex-1 flex-col">
                                            <span className="text-[16px] font-bold tracking-tight text-gray-800">
                                                {m.name}
                                            </span>
                                            <span className="mt-0.5 text-[13px] font-medium text-gray-400">
                                                {m.city?.name}, {m.city?.state}
                                                {m.fullAddress ? ` • ${m.fullAddress}` : ""}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleEdit(m as MandiItem)}
                                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#135B47]"
                                        >
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
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                ),
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
