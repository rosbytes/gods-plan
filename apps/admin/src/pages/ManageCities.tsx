import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { uploadImage } from "../lib/upload"
import type { CityItem } from "../types"
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
    BuildingIcon,
    BackIcon,
} from "../components/ui"

export default function ManageCities() {
    const navigate = useNavigate()
    const [showForm, setShowForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

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

    const filteredCities = useMemo(() => {
        if (!cities?.items) return []
        if (!searchQuery.trim()) return cities.items
        const query = searchQuery.toLowerCase()
        return cities.items.filter(
            (c) =>
                c.name.toLowerCase().includes(query) ||
                c.state.toLowerCase().includes(query) ||
                (c.pincode && c.pincode.includes(query)),
        )
    }, [cities, searchQuery])

    const handleSubmit = async () => {
        let cityImage: string | undefined
        if (imageFile) {
            setUploading(true)
            cityImage = await uploadImage(imageFile)
            setUploading(false)
        }
        if (imageFile && !cityImage) return

        createMutation.mutate({
            name,
            state,
            pincode: pincode || undefined,
            cityImage,
        })
    }

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

    const isFormValid = name.trim() !== "" && state.trim() !== ""
    const isEditValid = editName.trim() !== "" && editState.trim() !== ""
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
                        <h1 className="text-[18px] font-bold tracking-tight">Manage Cities</h1>
                    </div>

                    <div className="mt-2 flex-1 space-y-5 px-5">
                        {/* Create Form Toggle */}
                        {!showForm ? (
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-gray-300 bg-white py-4 text-[15px] font-semibold text-gray-500 transition-colors hover:border-[#135B47] hover:text-[#135B47]"
                            >
                                <PlusIcon size={20} />
                                Add New City
                            </button>
                        ) : (
                            <div className="divide-y divide-gray-100 overflow-hidden rounded-[18px] bg-white shadow-xs">
                                <div className="bg-[#135B47] px-5 py-3.5">
                                    <h2 className="text-[15px] font-semibold text-white">
                                        New City
                                    </h2>
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
                                    <ImageUploader
                                        label="City Image"
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
                                <div className="space-y-3">
                                    {cities?.items?.map((c) =>
                                        editingCity?.id === c.id ? (
                                            /* ---- EDIT FORM (inline) ---- */
                                            <div
                                                key={c.id}
                                                className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-xs"
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
                                                        onChange={(e) =>
                                                            setEditName(e.target.value)
                                                        }
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
                                                        onChange={(e) =>
                                                            setEditState(e.target.value)
                                                        }
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
                                                        onChange={(e) =>
                                                            setEditPincode(e.target.value)
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
                                                className="flex items-center gap-4 rounded-2xl border border-gray-50 bg-white p-4.5 shadow-xs transition-all hover:shadow-md"
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
                    title="Manage Cities"
                    subtitle="Configure operational cities and regional hub locations"
                >
                    {/* Create City Modal */}
                    <Modal
                        isOpen={showForm}
                        onClose={() => setShowForm(false)}
                        title="Add New City"
                        subtitle="Enter details for the new service location"
                    >
                        <div className="space-y-4">
                            <Input
                                label="City Name *"
                                placeholder="e.g. Jaipur"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Input
                                label="State *"
                                placeholder="e.g. Rajasthan"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                            />
                            <Input
                                label="Pincode (Optional)"
                                placeholder="e.g. 302001"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                            />
                            <ImageUploader
                                label="City Image (Optional)"
                                selectedFile={imageFile}
                                onFileSelect={setImageFile}
                                placeholder="Choose city image"
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
                                    Create City
                                </Button>
                            </div>
                        </div>
                    </Modal>

                    {/* Edit City Modal */}
                    <Modal
                        isOpen={Boolean(editingCity)}
                        onClose={() => setEditingCity(null)}
                        title="Edit City"
                        subtitle="Update city information"
                    >
                        <div className="space-y-4">
                            <Input
                                label="City Name *"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                            <Input
                                label="State *"
                                value={editState}
                                onChange={(e) => setEditState(e.target.value)}
                            />
                            <Input
                                label="Pincode"
                                value={editPincode}
                                onChange={(e) => setEditPincode(e.target.value)}
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
                                    onClick={() => setEditingCity(null)}
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

                    {/* Top Toolbar Card */}
                    <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#135B47]">
                                    <BuildingIcon size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">
                                        Cities Directory ({cities?.items?.length ?? 0})
                                    </h2>
                                    <p className="text-xs font-medium text-gray-400">
                                        Active service locations and pincodes
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
                                        placeholder="Search city or state..."
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
                                    Add City
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Content List / Grid */}
                    {isLoading ? (
                        <div className="flex justify-center py-16 text-gray-400">
                            <SpinnerIcon size={28} className="text-[#135B47]" />
                        </div>
                    ) : filteredCities.length === 0 ? (
                        <EmptyState
                            title="No Cities Found"
                            description={
                                searchQuery
                                    ? `No city matching "${searchQuery}"`
                                    : "Click below to add your first city."
                            }
                            action={
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={<PlusIcon size={16} />}
                                    onClick={() => setShowForm(true)}
                                >
                                    Add City
                                </Button>
                            }
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredCities.map((c) => (
                                <div
                                    key={c.id}
                                    className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4.5 shadow-xs transition-all hover:shadow-md"
                                >
                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-emerald-100/50 bg-emerald-50">
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
                                    <div className="flex flex-1 flex-col overflow-hidden">
                                        <span className="truncate text-[16px] font-bold tracking-tight text-gray-800 transition-colors group-hover:text-[#135B47]">
                                            {c.name}
                                        </span>
                                        <span className="mt-0.5 truncate text-xs font-medium text-gray-400">
                                            {c.state}
                                            {c.pincode ? ` • ${c.pincode}` : ""}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleEdit(c as CityItem)}
                                        className="cursor-pointer rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#135B47]"
                                        aria-label={`Edit ${c.name}`}
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
