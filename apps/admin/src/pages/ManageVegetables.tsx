import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { customFetch } from "../lib/customFetch"

type VegItem = {
    id: string
    name: string
    nameInHindi: string | null
    vegPrimaryImage: string | null
}

export default function ManageVegetables() {
    const navigate = useNavigate()
    const [showForm, setShowForm] = useState(false)

    // Create form state
    const [name, setName] = useState("")
    const [nameInHindi, setNameInHindi] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    const { data: vegs, isLoading, refetch } = trpc.veg.list.useQuery({})
    // Edit state
    const [editingVeg, setEditingVeg] = useState<VegItem | null>(null)
    const [editName, setEditName] = useState("")
    const [editNameInHindi, setEditNameInHindi] = useState("")
    const [editImageFile, setEditImageFile] = useState<File | null>(null)

    const createMutation = trpc.veg.create.useMutation({
        onSuccess: () => {
            setName("")
            setNameInHindi("")
            setImageFile(null)
            setShowForm(false)
            refetch()
        },
        onError: (e) => alert(e.message),
    })

    const updateMutation = trpc.veg.update.useMutation({
        onSuccess: () => {
            setEditingVeg(null)
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
        let vegPrimaryImage: string | undefined
        if (imageFile) {
            setUploading(true)
            vegPrimaryImage = await uploadImage(imageFile)
            setUploading(false)
        }
        if (!vegPrimaryImage) return

        createMutation.mutate({
            name,
            nameInHindi: nameInHindi || undefined,
            vegPrimaryImage,
        })
    }

    const isFormValid = name.trim() !== ""
    const handleEdit = (v: VegItem) => {
        setEditingVeg(v)
        setEditName(v.name)
        setEditNameInHindi(v.nameInHindi || "")
        setEditImageFile(null)
    }

    const handleUpdate = async () => {
        if (!editingVeg) return

        let vegPrimaryImage: string | undefined
        if (editImageFile) {
            setUploading(true)
            vegPrimaryImage = await uploadImage(editImageFile)
            setUploading(false)
            if (!vegPrimaryImage) return
        }

        updateMutation.mutate({
            id: editingVeg.id,
            name: editName !== editingVeg.name ? editName : undefined,
            nameInHindi:
                editNameInHindi !== (editingVeg.nameInHindi || "")
                    ? editNameInHindi || undefined
                    : undefined,
            vegPrimaryImage,
        })
    }

    const isEditValid = editName.trim() !== ""
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
                        Manage Vegetables
                    </h1>
                </div>

                <div className="mt-2 flex-1 space-y-5 px-5 md:px-8">
                    {/* Create Form */}
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
                            Add New Vegetable
                        </button>
                    ) : (
                        <div className="divide-y divide-gray-100 overflow-hidden rounded-[18px] bg-white shadow-sm md:max-w-xl">
                            <div className="bg-[#135B47] px-5 py-3.5">
                                <h2 className="text-[15px] font-semibold text-white">
                                    New Vegetable
                                </h2>
                            </div>
                            <div className="px-5 pt-4 pb-4">
                                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                    Name (English) *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Tomato"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                                />
                            </div>
                            <div className="px-5 pt-4 pb-4">
                                <div className="flex items-start justify-between">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                        Name (Hindi)
                                    </label>
                                    <span className="text-xs font-medium text-gray-400">
                                        Optional
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. टमाटर"
                                    value={nameInHindi}
                                    onChange={(e) => setNameInHindi(e.target.value)}
                                    className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                                />
                            </div>
                            <div className="px-5 pt-4 pb-4">
                                <div className="flex items-start justify-between">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                        Vegetable Image
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
                                    {isPending ? "Saving..." : "Create Vegetable"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Vegetables List */}
                    <div>
                        <p className="mb-3 text-[14px] font-semibold text-gray-500">
                            All Vegetables {vegs?.items && `(${vegs.items.length})`}
                        </p>

                        {isLoading ? (
                            <div className="mt-10 flex justify-center text-gray-400">
                                Loading...
                            </div>
                        ) : vegs?.items?.length === 0 ? (
                            <div className="mt-10 text-center text-sm text-gray-400">
                                No vegetables added yet.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
                                {vegs?.items?.map((v) =>
                                    editingVeg?.id === v.id ? (
                                        /* ---- EDIT FORM ---- */
                                        <div
                                            key={v.id}
                                            className="col-span-2 divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm sm:col-span-3 md:col-span-4 lg:col-span-5"
                                        >
                                            <div className="bg-[#0f4d3c] px-5 py-3">
                                                <h3 className="text-[14px] font-semibold text-white">
                                                    Edit Vegetable
                                                </h3>
                                            </div>
                                            <div className="px-5 pt-3.5 pb-3.5">
                                                <label className="mb-1 block text-xs font-medium text-gray-400">
                                                    Name (English) *
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
                                                    Name (Hindi)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editNameInHindi}
                                                    onChange={(e) =>
                                                        setEditNameInHindi(e.target.value)
                                                    }
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
                                                    onClick={() => setEditingVeg(null)}
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
                                            key={v.id}
                                            className="overflow-hidden rounded-2xl border border-gray-50 bg-white shadow-sm transition-all hover:shadow-md"
                                        >
                                            <div className="relative h-28 w-full bg-[#E8F3F0]">
                                                {v.vegPrimaryImage ? (
                                                    <img
                                                        src={v.vegPrimaryImage}
                                                        alt={v.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-3xl">
                                                        🥬
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(v as VegItem)}
                                                    className="absolute top-2 right-2 cursor-pointer rounded-lg bg-white/90 p-1.5 text-gray-500 shadow-sm transition-colors hover:text-[#135B47]"
                                                >
                                                    <svg
                                                        width="14"
                                                        height="14"
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
                                            <div className="px-3.5 py-3">
                                                <p className="text-[15px] font-bold tracking-tight text-gray-800">
                                                    {v.name}
                                                </p>
                                                {v.nameInHindi && (
                                                    <p className="mt-0.5 text-[13px] font-medium text-gray-400">
                                                        {v.nameInHindi}
                                                    </p>
                                                )}
                                            </div>
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
