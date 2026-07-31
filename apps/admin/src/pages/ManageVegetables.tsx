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

    // Form state
    const [name, setName] = useState("")
    const [nameInHindi, setNameInHindi] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    const { data: vegs, isLoading, refetch } = trpc.veg.list.useQuery({})

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
            try {
                const formData = new FormData()
                formData.append("file", imageFile)
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/media/upload`, {
                    method: "POST",
                    body: formData,
                })
                const data = await res.json()
                if (data.success) vegPrimaryImage = data.url
            } catch {
                alert("Image upload failed")
            }
            setUploading(false)
        }

        createMutation.mutate({
            name,
            nameInHindi: nameInHindi || undefined,
            vegPrimaryImage,
        })
    }

    const isFormValid = name.trim() !== ""
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
                <h1 className="text-[18px] font-bold tracking-tight">Manage Vegetables</h1>
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
                        Add New Vegetable
                    </button>
                ) : (
                    <div className="divide-y divide-gray-100 overflow-hidden rounded-[18px] bg-white shadow-sm">
                        <div className="bg-[#135B47] px-5 py-3.5">
                            <h2 className="text-[15px] font-semibold text-white">New Vegetable</h2>
                        </div>

                        {/* Veg Name */}
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

                        {/* Hindi Name */}
                        <div className="px-5 pt-4 pb-4">
                            <div className="flex items-start justify-between">
                                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                    Name (Hindi)
                                </label>
                                <span className="text-xs font-medium text-gray-400">Optional</span>
                            </div>
                            <input
                                type="text"
                                placeholder="e.g. टमाटर"
                                value={nameInHindi}
                                onChange={(e) => setNameInHindi(e.target.value)}
                                className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="px-5 pt-4 pb-4">
                            <div className="flex items-start justify-between">
                                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                    Vegetable Image
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
                        <div className="mt-10 flex justify-center text-gray-400">Loading...</div>
                    ) : vegs?.items?.length === 0 ? (
                        <div className="mt-10 text-center text-sm text-gray-400">
                            No vegetables added yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {vegs?.items?.map((v) => (
                                <div
                                    key={v.id}
                                    className="overflow-hidden rounded-2xl border border-gray-50 bg-white shadow-sm"
                                >
                                    {/* Veg Image or Placeholder */}
                                    <div className="h-28 w-full bg-[#E8F3F0]">
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
