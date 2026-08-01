import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { customFetch } from "../lib/customFetch"

type CityItem = {
    id: string
    name: string
    state: string
    pincode: string | null
    cityImage: string | null
}

export default function ManageCities() {
    const navigate = useNavigate()
    const [showForm, setShowForm] = useState(false)

    // Form state
    const [name, setName] = useState("")
    const [state, setState] = useState("")
    const [pincode, setPincode] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    const { data: cities, isLoading, refetch } = trpc.city.list.useQuery({})
    // Edit state
    const [editingCity, setEditingCity] = useState<CityItem | null>(null)
    const [editName, setEditName] = useState("")
    const [editState, setEditState] = useState("")
    const [editPincode, setEditPincode] = useState("")
    const [editImageFile, setEditImageFile] = useState<File | null>(null)

    const createMutation = trpc.city.create.useMutation({
        onSuccess: () => {
            setName("")
            setState("")
            setPincode("")
            setImageFile(null)
            setShowForm(false)
            refetch()
        },
        onError: (e) => alert(e.message),
    })

    const updateMutation = trpc.city.update.useMutation({
        onSuccess: () => {
            setEditingCity(null)
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

    const handleSubmit = async () => {
        let cityImage: string | undefined
        if (imageFile) {
            setUploading(true)
            cityImage = await uploadImage(imageFile)
            setUploading(false)
        }
        if (!cityImage) return

        createMutation.mutate({
            name,
            state,
            pincode: pincode || undefined,
            cityImage,
        })
    }

    const isFormValid = name.trim() !== "" && state.trim() !== ""
    const handleEdit = (c: CityItem) => {
        setEditingCity(c)
        setEditName(c.name)
        setEditState(c.state)
        setEditPincode(c.pincode || "")
        setEditImageFile(null)
    }

    const handleUpdate = async () => {
        if (!editingCity) return

        let cityImage: string | undefined
        if (editImageFile) {
            setUploading(true)
            cityImage = await uploadImage(editImageFile)
            setUploading(false)
            if (!cityImage) return
        }

        updateMutation.mutate({
            id: editingCity.id,
            name: editName !== editingCity.name ? editName : undefined,
            state: editState !== editingCity.state ? editState : undefined,
            pincode:
                editPincode !== (editingCity.pincode || "") ? editPincode || undefined : undefined,
            cityImage,
        })
    }

    const isEditValid = editName.trim() !== "" && editState.trim() !== ""
    const isPending = createMutation.isPending || updateMutation.isPending || uploading

    return (
        <div className="flex min-h-screen flex-col bg-[#F5F6F8] pb-28 font-sans text-gray-900">
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
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
                        Manage Cities
                    </h1>
                </div>

                <div className="mt-2 flex-1 space-y-5 px-5 md:px-8">
                    {/* Create Form Toggle */}
                    {!showForm ? (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-gray-300 bg-white py-4 text-[15px] font-semibold text-gray-500 transition-colors hover:border-[#135B47] hover:text-[#135B47] md:max-w-md"
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
                            Add New City
                        </button>
                    ) : (
                        <div className="divide-y divide-gray-100 overflow-hidden rounded-[18px] bg-white shadow-sm md:max-w-xl">
                            <div className="bg-[#135B47] px-5 py-3.5">
                                <h2 className="text-[15px] font-semibold text-white">New City</h2>
                            </div>
                            <div className="px-5 pt-4 pb-4">
                                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                    City Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Jaipur"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                                />
                            </div>
                            <div className="px-5 pt-4 pb-4">
                                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                    State *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Rajasthan"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                                />
                            </div>
                            <div className="px-5 pt-4 pb-4">
                                <div className="flex items-start justify-between">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                        Pincode
                                    </label>
                                    <span className="text-xs font-medium text-gray-400">
                                        Optional
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. 302001"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                                />
                            </div>
                            <div className="px-5 pt-4 pb-4">
                                <div className="flex items-start justify-between">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                        City Image
                                    </label>
                                    <span className="text-xs font-medium text-gray-400">
                                        Optional
                                    </span>
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
                                    className="flex-1 cursor-pointer rounded-xl bg-gray-100 py-3 text-[14px] font-semibold text-gray-600 transition-colors hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isFormValid || isPending}
                                    className="flex-1 cursor-pointer rounded-xl bg-[#135B47] py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#0f4d3c] disabled:opacity-60"
                                >
                                    {isPending ? "Saving..." : "Create City"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Cities List */}
                    <div>
                        <p className="mb-3 text-[14px] font-semibold text-gray-500">
                            All Cities {cities?.items && `(${cities.items.length})`}
                        </p>

                        {isLoading ? (
                            <div className="mt-10 flex justify-center text-gray-400">
                                Loading...
                            </div>
                        ) : cities?.items?.length === 0 ? (
                            <div className="mt-10 text-center text-sm text-gray-400">
                                No cities added yet.
                            </div>
                        ) : (
                            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
                                {cities?.items?.map((c) =>
                                    editingCity?.id === c.id ? (
                                        /* ---- EDIT FORM (inline) ---- */
                                        <div
                                            key={c.id}
                                            className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm"
                                        >
                                            <div className="bg-[#0f4d3c] px-5 py-3">
                                                <h3 className="text-[14px] font-semibold text-white">
                                                    Edit City
                                                </h3>
                                            </div>
                                            <div className="px-5 pt-3.5 pb-3.5">
                                                <label className="mb-1 block text-xs font-medium text-gray-400">
                                                    City Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full bg-transparent text-[15px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                                                />
                                            </div>
                                            <div className="px-5 pt-3.5 pb-3.5">
                                                <label className="mb-1 block text-xs font-medium text-gray-400">
                                                    State *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editState}
                                                    onChange={(e) => setEditState(e.target.value)}
                                                    className="w-full bg-transparent text-[15px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                                                />
                                            </div>
                                            <div className="px-5 pt-3.5 pb-3.5">
                                                <label className="mb-1 block text-xs font-medium text-gray-400">
                                                    Pincode
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editPincode}
                                                    onChange={(e) => setEditPincode(e.target.value)}
                                                    className="w-full bg-transparent text-[15px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
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
                                                    onClick={() => setEditingCity(null)}
                                                    className="flex-1 cursor-pointer rounded-xl bg-gray-100 py-2.5 text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-200"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleUpdate}
                                                    disabled={!isEditValid || isPending}
                                                    className="flex-1 cursor-pointer rounded-xl bg-[#135B47] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#0f4d3c] disabled:opacity-60"
                                                >
                                                    {isPending ? "Saving..." : "Save Changes"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* ---- DISPLAY CARD ---- */
                                        <div
                                            key={c.id}
                                            className="flex items-center gap-4 rounded-2xl border border-gray-50 bg-white p-4.5 shadow-sm transition-all hover:shadow-md"
                                        >
                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#E8F3F0]">
                                                {c.cityImage ? (
                                                    <img
                                                        src={c.cityImage}
                                                        alt={c.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xl">
                                                        🏙️
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-1 flex-col">
                                                <span className="text-[16px] font-bold tracking-tight text-gray-800">
                                                    {c.name}
                                                </span>
                                                <span className="mt-0.5 text-[13px] font-medium text-gray-400">
                                                    {c.state}
                                                    {c.pincode ? ` • ${c.pincode}` : ""}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleEdit(c as CityItem)}
                                                className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#135B47]"
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
        </div>
    )
}
