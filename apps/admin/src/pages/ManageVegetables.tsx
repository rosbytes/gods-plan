import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { uploadImage } from "../lib/upload"
import type { VegetableItem } from "../types"
import { AdminLayout } from "../components/layout"
import {
    Button,
    Input,
    Modal,
    ImageUploader,
    EmptyState,
    PlusIcon,
    EditIcon,
    SearchIcon,
    SpinnerIcon,
    VegIcon,
    BackIcon,
} from "../components/ui"

export default function ManageVegetables() {
    const navigate = useNavigate()
    const [showForm, setShowForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // Form state
    const [name, setName] = useState("")
    const [hindiName, setHindiName] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    const { data: vegetables, isLoading, refetch } = trpc.veg.list.useQuery({})

    // Edit state
    const [editingVeg, setEditingVeg] = useState<VegetableItem | null>(null)
    const [editName, setEditName] = useState("")
    const [editHindiName, setEditHindiName] = useState("")
    const [editImageFile, setEditImageFile] = useState<File | null>(null)

    const createMutation = trpc.veg.create.useMutation({
        onSuccess: () => {
            setName("")
            setHindiName("")
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

    const filteredVegetables = useMemo(() => {
        if (!vegetables?.items) return []
        if (!searchQuery.trim()) return vegetables.items
        const query = searchQuery.toLowerCase()
        return vegetables.items.filter(
            (v) =>
                v.name.toLowerCase().includes(query) ||
                (v.nameInHindi && v.nameInHindi.toLowerCase().includes(query)),
        )
    }, [vegetables, searchQuery])

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
            nameInHindi: hindiName || undefined,
            vegPrimaryImage,
        })
    }

    const handleEdit = (v: VegetableItem) => {
        setEditingVeg(v)
        setEditName(v.name)
        setEditHindiName(v.nameInHindi || "")
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
                editHindiName !== (editingVeg.nameInHindi || "")
                    ? editHindiName || undefined
                    : undefined,
            vegPrimaryImage,
        })
    }

    const isFormValid = name.trim() !== ""
    const isEditValid = editName.trim() !== ""
    const isPending = createMutation.isPending || updateMutation.isPending || uploading

    return (
        <>
            {/* ========================================================================= */}
            {/* MOBILE VIEW (< 1024px) — 100% PRESERVED ORIGINAL MOBILE DESIGN            */}
            {/* ========================================================================= */}
            <div className="flex min-h-screen flex-col bg-[#F5F6F8] pb-28 font-sans text-gray-900 lg:hidden">
                <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-5 pt-12 pb-4">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-200"
                        >
                            <BackIcon size={22} />
                        </button>
                        <h1 className="text-[18px] font-bold tracking-tight">Manage Vegetables</h1>
                    </div>

                    <div className="mt-2 flex-1 space-y-5 px-5">
                        {/* Create Form Toggle */}
                        {!showForm ? (
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-gray-300 bg-white py-4 text-[15px] font-semibold text-gray-500 transition-colors hover:border-[#135B47] hover:text-[#135B47]"
                            >
                                <PlusIcon size={20} />
                                Add New Vegetable
                            </button>
                        ) : (
                            <div className="divide-y divide-gray-100 overflow-hidden rounded-[18px] bg-white shadow-xs">
                                <div className="bg-[#135B47] px-5 py-3.5">
                                    <h2 className="text-[15px] font-semibold text-white">
                                        New Vegetable
                                    </h2>
                                </div>
                                <div className="px-5 pt-4 pb-4">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                        Vegetable Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Potato"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                                    />
                                </div>
                                <div className="px-5 pt-4 pb-4">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                        Hindi Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. आलू"
                                        value={hindiName}
                                        onChange={(e) => setHindiName(e.target.value)}
                                        className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                                    />
                                </div>
                                <div className="px-5 pt-4 pb-4">
                                    <ImageUploader
                                        label="Vegetable Image *"
                                        selectedFile={imageFile}
                                        onFileSelect={setImageFile}
                                        placeholder="Choose image"
                                    />
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
                                        {isPending ? "Saving..." : "Add Item"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* List Header */}
                        <div>
                            <p className="mb-3 text-[14px] font-semibold text-gray-500">
                                All Vegetables {vegetables?.items && `(${vegetables.items.length})`}
                            </p>

                            {isLoading ? (
                                <div className="mt-10 flex justify-center text-gray-400">
                                    Loading...
                                </div>
                            ) : vegetables?.items?.length === 0 ? (
                                <div className="mt-10 text-center text-sm text-gray-400">
                                    No vegetables cataloged yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {vegetables?.items?.map((v) =>
                                        editingVeg?.id === v.id ? (
                                            /* ---- EDIT FORM (inline) ---- */
                                            <div
                                                key={v.id}
                                                className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-xs"
                                            >
                                                <div className="bg-[#0f4d3c] px-5 py-3">
                                                    <h3 className="text-[14px] font-semibold text-white">
                                                        Edit Vegetable
                                                    </h3>
                                                </div>
                                                <div className="px-5 pt-3.5 pb-3.5">
                                                    <label className="mb-1 block text-xs font-medium text-gray-400">
                                                        Vegetable Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) =>
                                                            setEditName(e.target.value)
                                                        }
                                                        className="w-full bg-transparent text-[15px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                                                    />
                                                </div>
                                                <div className="px-5 pt-3.5 pb-3.5">
                                                    <label className="mb-1 block text-xs font-medium text-gray-400">
                                                        Hindi Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editHindiName}
                                                        onChange={(e) =>
                                                            setEditHindiName(e.target.value)
                                                        }
                                                        className="w-full bg-transparent text-[15px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                                                    />
                                                </div>
                                                <div className="px-5 pt-3.5 pb-3.5">
                                                    <ImageUploader
                                                        label="Update Image"
                                                        selectedFile={editImageFile}
                                                        onFileSelect={setEditImageFile}
                                                        placeholder="Choose new image"
                                                    />
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
                                                className="flex items-center gap-4 rounded-2xl border border-gray-50 bg-white p-4.5 shadow-xs transition-all hover:shadow-md"
                                            >
                                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#E8F3F0]">
                                                    {v.vegPrimaryImage ? (
                                                        <img
                                                            src={v.vegPrimaryImage}
                                                            alt={v.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-xl">
                                                            🥦
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-1 flex-col truncate">
                                                    <span className="truncate text-[16px] font-bold tracking-tight text-gray-800">
                                                        {v.name}
                                                    </span>
                                                    <span className="mt-0.5 truncate text-[13px] font-medium text-gray-400">
                                                        {v.nameInHindi
                                                            ? `${v.nameInHindi}`
                                                            : "No Hindi name"}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleEdit(v as VegetableItem)}
                                                    className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#135B47]"
                                                >
                                                    <EditIcon size={18} />
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

            {/* ========================================================================= */}
            {/* DESKTOP VIEW (>= 1024px) — ELEVATED DESKTOP DASHBOARD                      */}
            {/* ========================================================================= */}
            <div className="hidden lg:block">
                <AdminLayout
                    title="Manage Vegetables"
                    subtitle="Catalog and configure fresh produce database"
                >
                    {/* Create Vegetable Modal */}
                    <Modal
                        isOpen={showForm}
                        onClose={() => setShowForm(false)}
                        title="Add New Vegetable"
                        subtitle="Register fresh produce into catalog"
                    >
                        <div className="space-y-4">
                            <Input
                                label="Vegetable Name *"
                                placeholder="e.g. Potato"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Input
                                label="Hindi Name (Optional)"
                                placeholder="e.g. आलू"
                                value={hindiName}
                                onChange={(e) => setHindiName(e.target.value)}
                            />
                            <ImageUploader
                                label="Vegetable Image *"
                                selectedFile={imageFile}
                                onFileSelect={setImageFile}
                                placeholder="Choose item image"
                            />
                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    fullWidth
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    fullWidth
                                    isLoading={isPending}
                                    disabled={!isFormValid}
                                    onClick={handleSubmit}
                                >
                                    Add Item
                                </Button>
                            </div>
                        </div>
                    </Modal>

                    {/* Edit Vegetable Modal */}
                    <Modal
                        isOpen={Boolean(editingVeg)}
                        onClose={() => setEditingVeg(null)}
                        title="Edit Vegetable"
                        subtitle="Update produce information"
                    >
                        <div className="space-y-4">
                            <Input
                                label="Vegetable Name *"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                            <Input
                                label="Hindi Name"
                                value={editHindiName}
                                onChange={(e) => setEditHindiName(e.target.value)}
                            />
                            <ImageUploader
                                label="Update Image"
                                selectedFile={editImageFile}
                                onFileSelect={setEditImageFile}
                                placeholder="Choose new image"
                            />
                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    fullWidth
                                    onClick={() => setEditingVeg(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    fullWidth
                                    isLoading={isPending}
                                    disabled={!isEditValid}
                                    onClick={handleUpdate}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </Modal>

                    {/* Toolbar Banner */}
                    <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#135B47]">
                                    <VegIcon size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">
                                        Vegetable Catalog ({vegetables?.items?.length ?? 0})
                                    </h2>
                                    <p className="text-xs font-medium text-gray-400">
                                        Fresh produce items and names
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative min-w-55">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <SearchIcon size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pr-3 pl-9 text-xs font-medium text-gray-800 transition-colors placeholder:text-gray-400 focus:border-[#135B47] focus:bg-white focus:outline-none"
                                        placeholder="Search produce item..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <Button
                                    variant="primary"
                                    size="md"
                                    icon={<PlusIcon size={18} />}
                                    onClick={() => setShowForm(true)}
                                >
                                    Add Vegetable
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Vegetables Grid */}
                    {isLoading ? (
                        <div className="flex justify-center py-16 text-gray-400">
                            <SpinnerIcon size={28} className="text-[#135B47]" />
                        </div>
                    ) : filteredVegetables.length === 0 ? (
                        <EmptyState
                            title="No Produce Cataloged"
                            description={
                                searchQuery
                                    ? `No produce matching "${searchQuery}"`
                                    : "Click below to add produce items."
                            }
                            action={
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={<PlusIcon size={16} />}
                                    onClick={() => setShowForm(true)}
                                >
                                    Add Vegetable
                                </Button>
                            }
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredVegetables.map((v) => (
                                <div
                                    key={v.id}
                                    className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4.5 shadow-xs transition-all hover:shadow-md"
                                >
                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-emerald-100/50 bg-emerald-50">
                                        {v.vegPrimaryImage ? (
                                            <img
                                                src={v.vegPrimaryImage}
                                                alt={v.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xl">
                                                🥦
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col overflow-hidden">
                                        <span className="truncate text-[16px] font-bold tracking-tight text-gray-800 transition-colors group-hover:text-[#135B47]">
                                            {v.name}
                                        </span>
                                        <span className="mt-0.5 truncate text-xs font-medium text-gray-400">
                                            {v.nameInHindi ? `${v.nameInHindi}` : "No Hindi name"}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleEdit(v as VegetableItem)}
                                        className="cursor-pointer rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#135B47]"
                                        aria-label={`Edit ${v.name}`}
                                    >
                                        <EditIcon size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </AdminLayout>
            </div>
        </>
    )
}
