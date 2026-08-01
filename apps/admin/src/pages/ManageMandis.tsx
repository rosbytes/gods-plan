import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { uploadImage } from "../lib/upload"
import type { MandiItem } from "../types"
import { toast } from "sonner"
import { AdminLayout } from "../components/layout"
import {
    Button,
    Input,
    Modal,
    ImageUploader,
    EmptyState,
    PlusIcon,
    EditIcon,
    TrashIcon,
    SearchIcon,
    LocationIcon,
    SpinnerIcon,
    StoreIcon,
    BackIcon,
} from "../components/ui"

export default function ManageMandis() {
    const navigate = useNavigate()
    const [showForm, setShowForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

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

    // Edit state
    const [editingMandi, setEditingMandi] = useState<MandiItem | null>(null)
    const [editName, setEditName] = useState("")
    const [editCityId, setEditCityId] = useState("")
    const [editLat, setEditLat] = useState("")
    const [editLng, setEditLng] = useState("")
    const [editFullAddress, setEditFullAddress] = useState("")
    const [editImageFile, setEditImageFile] = useState<File | null>(null)

    // Delete state
    const [deletingMandi, setDeletingMandi] = useState<MandiItem | null>(null)

    const createMutation = trpc.mandi.create.useMutation({
        onSuccess: () => {
            setName("")
            setCityId("")
            setLat("")
            setLng("")
            setFullAddress("")
            setImageFile(null)
            setShowForm(false)
            toast.success("Mandi created successfully")
            refetch()
        },
        onError: (e) => toast.error(e.message),
    })

    const updateMutation = trpc.mandi.update.useMutation({
        onSuccess: () => {
            setEditingMandi(null)
            setEditImageFile(null)
            toast.success("Mandi updated successfully")
            refetch()
        },
        onError: (e) => toast.error(e.message),
    })

    const deleteMutation = trpc.mandi.delete.useMutation({
        onSuccess: () => {
            setDeletingMandi(null)
            toast.success("Mandi deleted successfully")
            refetch()
        },
        onError: (e) => toast.error(e.message),
    })

    const filteredMandis = useMemo(() => {
        if (!mandis?.items) return []
        if (!searchQuery.trim()) return mandis.items
        const query = searchQuery.toLowerCase()
        return mandis.items.filter(
            (m) =>
                m.name.toLowerCase().includes(query) ||
                (m.city?.name && m.city.name.toLowerCase().includes(query)) ||
                (m.fullAddress && m.fullAddress.toLowerCase().includes(query)),
        )
    }, [mandis, searchQuery])

    const handleGetLocation = (isEdit = false) => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser")
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
                const fallbackLat = "26.837300"
                const fallbackLng = "75.836000"
                if (isEdit) {
                    setEditLat(fallbackLat)
                    setEditLng(fallbackLng)
                } else {
                    setLat(fallbackLat)
                    setLng(fallbackLng)
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
            lat: editLat !== String(editingMandi.lat) ? parseFloat(editLat) : undefined,
            lng: editLng !== String(editingMandi.lng) ? parseFloat(editLng) : undefined,
            fullAddress:
                editFullAddress !== (editingMandi.fullAddress || "")
                    ? editFullAddress || undefined
                    : undefined,
            mandiImage,
        })
    }

    const handleDeleteConfirm = () => {
        if (deletingMandi) {
            deleteMutation.mutate({ id: deletingMandi.id })
        }
    }

    const isFormValid = name.trim() !== "" && cityId !== "" && lat !== "" && lng !== ""
    const isEditValid =
        editName.trim() !== "" && editCityId !== "" && editLat !== "" && editLng !== ""
    const isPending = createMutation.isPending || updateMutation.isPending || uploading

    return (
        <>
            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={Boolean(deletingMandi)}
                onClose={() => setDeletingMandi(null)}
                title="Confirm Deletion"
                subtitle="Are you sure you want to delete this mandi?"
            >
                <div className="space-y-4">
                    <p className="text-xs font-semibold text-gray-600">
                        This action will remove{" "}
                        <strong className="text-gray-900">{deletingMandi?.name}</strong>{" "}
                        permanently.
                    </p>
                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" fullWidth onClick={() => setDeletingMandi(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            fullWidth
                            isLoading={deleteMutation.isPending}
                            onClick={handleDeleteConfirm}
                        >
                            Delete Mandi
                        </Button>
                    </div>
                </div>
            </Modal>

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
                        <h1 className="text-[18px] font-bold tracking-tight">Manage Mandis</h1>
                    </div>

                    <div className="mt-2 flex-1 space-y-5 px-5">
                        {/* Create Form Toggle */}
                        {!showForm ? (
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-gray-300 bg-white py-4 text-[15px] font-semibold text-gray-500 transition-colors hover:border-[#135B47] hover:text-[#135B47]"
                            >
                                <PlusIcon size={20} />
                                Add New Mandi
                            </button>
                        ) : (
                            <div className="divide-y divide-gray-100 overflow-hidden rounded-[18px] bg-white shadow-xs">
                                <div className="bg-[#135B47] px-5 py-3.5">
                                    <h2 className="text-[15px] font-semibold text-white">
                                        New Mandi
                                    </h2>
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
                                        className="w-full cursor-pointer appearance-none bg-transparent text-[16px] font-semibold text-gray-800 focus:outline-none"
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
                                    <div className="flex items-center justify-between">
                                        <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                            Location Coordinates *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => handleGetLocation(false)}
                                            disabled={isFetchingLocation}
                                            className="cursor-pointer text-xs font-semibold text-[#135B47] hover:underline disabled:opacity-50"
                                        >
                                            {isFetchingLocation
                                                ? "Fetching..."
                                                : "📍 Get Current Location"}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="Latitude"
                                            value={lat}
                                            onChange={(e) => setLat(e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-[14px] font-semibold text-gray-800 focus:border-[#135B47] focus:outline-none"
                                        />
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="Longitude"
                                            value={lng}
                                            onChange={(e) => setLng(e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-[14px] font-semibold text-gray-800 focus:border-[#135B47] focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="px-5 pt-4 pb-4">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                        Full Address
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Sanganer Road, Muhana"
                                        value={fullAddress}
                                        onChange={(e) => setFullAddress(e.target.value)}
                                        className="w-full bg-transparent text-[16px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                                    />
                                </div>
                                <div className="px-5 pt-4 pb-4">
                                    <ImageUploader
                                        label="Mandi Image *"
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
                                <div className="mt-10 flex justify-center text-gray-400">
                                    Loading...
                                </div>
                            ) : mandis?.items?.length === 0 ? (
                                <div className="mt-10 text-center text-sm text-gray-400">
                                    No mandis added yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {mandis?.items?.map((m) =>
                                        editingMandi?.id === m.id ? (
                                            /* ---- EDIT FORM (inline) ---- */
                                            <div
                                                key={m.id}
                                                className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-xs"
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
                                                        onChange={(e) =>
                                                            setEditName(e.target.value)
                                                        }
                                                        className="w-full bg-transparent text-[15px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
                                                    />
                                                </div>
                                                <div className="px-5 pt-3.5 pb-3.5">
                                                    <label className="mb-1 block text-xs font-medium text-gray-400">
                                                        City *
                                                    </label>
                                                    <select
                                                        value={editCityId}
                                                        onChange={(e) =>
                                                            setEditCityId(e.target.value)
                                                        }
                                                        className="w-full cursor-pointer appearance-none bg-transparent text-[15px] font-semibold text-gray-800 focus:outline-none"
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
                                                    <div className="flex items-center justify-between">
                                                        <label className="mb-1 block text-xs font-medium text-gray-400">
                                                            Location Coordinates *
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleGetLocation(true)}
                                                            disabled={isFetchingLocation}
                                                            className="cursor-pointer text-xs font-semibold text-[#135B47] hover:underline disabled:opacity-50"
                                                        >
                                                            {isFetchingLocation
                                                                ? "Fetching..."
                                                                : "📍 Get Current Location"}
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={editLat}
                                                            onChange={(e) =>
                                                                setEditLat(e.target.value)
                                                            }
                                                            className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-[14px] font-semibold text-gray-800 focus:border-[#135B47] focus:outline-none"
                                                        />
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={editLng}
                                                            onChange={(e) =>
                                                                setEditLng(e.target.value)
                                                            }
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
                                                        onChange={(e) =>
                                                            setEditFullAddress(e.target.value)
                                                        }
                                                        className="w-full bg-transparent text-[15px] font-semibold text-gray-800 focus:outline-none"
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
                                                        onClick={() => setEditingMandi(null)}
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
                                                key={m.id}
                                                className="flex items-center gap-4 rounded-2xl border border-gray-50 bg-white p-4.5 shadow-xs transition-all hover:shadow-md"
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
                                                            🌾
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-1 flex-col">
                                                    <span className="truncate text-[16px] font-bold tracking-tight text-gray-800">
                                                        {m.name}
                                                    </span>
                                                    <span className="mt-0.5 truncate text-[13px] font-medium text-gray-400">
                                                        {m.city?.name ?? "Unknown City"}
                                                        {m.fullAddress ? ` • ${m.fullAddress}` : ""}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleEdit(m as MandiItem)}
                                                        className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#135B47]"
                                                    >
                                                        <EditIcon size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setDeletingMandi(m as MandiItem)
                                                        }
                                                        className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <TrashIcon size={18} />
                                                    </button>
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

            {/* ========================================================================= */}
            {/* DESKTOP VIEW (>= 1024px) — ELEVATED DESKTOP DASHBOARD                      */}
            {/* ========================================================================= */}
            <div className="hidden lg:block">
                <AdminLayout
                    title="Manage Mandis"
                    subtitle="Configure wholesale mandi locations and geospatial coordinates"
                >
                    {/* Create Mandi Modal */}
                    <Modal
                        isOpen={showForm}
                        onClose={() => setShowForm(false)}
                        title="Add New Mandi"
                        subtitle="Register a new mandi with geolocation coordinates"
                    >
                        <div className="space-y-4">
                            <Input
                                label="Mandi Name *"
                                placeholder="e.g. Muhana Mandi"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                    City *
                                </label>
                                <select
                                    value={cityId}
                                    onChange={(e) => setCityId(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] font-semibold text-gray-800 focus:border-[#135B47] focus:outline-none"
                                >
                                    <option value="">Select a city</option>
                                    {cities?.items?.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}, {c.state}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label className="text-xs font-medium text-gray-500">
                                        Location Coordinates *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => handleGetLocation(false)}
                                        disabled={isFetchingLocation}
                                        className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#135B47] hover:underline disabled:opacity-50"
                                    >
                                        <LocationIcon size={14} />
                                        {isFetchingLocation
                                            ? "Fetching..."
                                            : "Get Current Location"}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder="Latitude"
                                        value={lat}
                                        onChange={(e) => setLat(e.target.value)}
                                    />
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder="Longitude"
                                        value={lng}
                                        onChange={(e) => setLng(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Input
                                label="Full Address (Optional)"
                                placeholder="e.g. Sanganer Road, Muhana"
                                value={fullAddress}
                                onChange={(e) => setFullAddress(e.target.value)}
                            />
                            <ImageUploader
                                label="Mandi Image *"
                                selectedFile={imageFile}
                                onFileSelect={setImageFile}
                                placeholder="Choose mandi image"
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
                                    Create Mandi
                                </Button>
                            </div>
                        </div>
                    </Modal>

                    {/* Edit Mandi Modal */}
                    <Modal
                        isOpen={Boolean(editingMandi)}
                        onClose={() => setEditingMandi(null)}
                        title="Edit Mandi"
                        subtitle="Update mandi details and location"
                    >
                        <div className="space-y-4">
                            <Input
                                label="Mandi Name *"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                    City *
                                </label>
                                <select
                                    value={editCityId}
                                    onChange={(e) => setEditCityId(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] font-semibold text-gray-800 focus:border-[#135B47] focus:outline-none"
                                >
                                    <option value="">Select a city</option>
                                    {cities?.items?.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}, {c.state}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label className="text-xs font-medium text-gray-500">
                                        Location Coordinates *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => handleGetLocation(true)}
                                        disabled={isFetchingLocation}
                                        className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#135B47] hover:underline disabled:opacity-50"
                                    >
                                        <LocationIcon size={14} />
                                        {isFetchingLocation
                                            ? "Fetching..."
                                            : "Get Current Location"}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        type="number"
                                        step="any"
                                        value={editLat}
                                        onChange={(e) => setEditLat(e.target.value)}
                                    />
                                    <Input
                                        type="number"
                                        step="any"
                                        value={editLng}
                                        onChange={(e) => setEditLng(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Input
                                label="Full Address"
                                value={editFullAddress}
                                onChange={(e) => setEditFullAddress(e.target.value)}
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
                                    onClick={() => setEditingMandi(null)}
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
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                                    <StoreIcon size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">
                                        Mandis Hub ({mandis?.items?.length ?? 0})
                                    </h2>
                                    <p className="text-xs font-medium text-gray-400">
                                        Wholesale market centers and coordinates
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
                                        placeholder="Search mandi or location..."
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
                                    Add Mandi
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Mandi Cards Grid */}
                    {isLoading ? (
                        <div className="flex justify-center py-16 text-gray-400">
                            <SpinnerIcon size={28} className="text-[#135B47]" />
                        </div>
                    ) : filteredMandis.length === 0 ? (
                        <EmptyState
                            title="No Mandis Registered"
                            description={
                                searchQuery
                                    ? `No mandi matching "${searchQuery}"`
                                    : "Click below to register your first mandi."
                            }
                            action={
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={<PlusIcon size={16} />}
                                    onClick={() => setShowForm(true)}
                                >
                                    Add Mandi
                                </Button>
                            }
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredMandis.map((m) => (
                                <div
                                    key={m.id}
                                    className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4.5 shadow-xs transition-all hover:shadow-md"
                                >
                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-amber-100/50 bg-amber-50/60">
                                        {m.mandiImage ? (
                                            <img
                                                src={m.mandiImage}
                                                alt={m.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xl">
                                                🌾
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col overflow-hidden">
                                        <span className="truncate text-[16px] font-bold tracking-tight text-gray-800 transition-colors group-hover:text-[#135B47]">
                                            {m.name}
                                        </span>
                                        <span className="mt-0.5 truncate text-xs font-medium text-gray-400">
                                            {m.city?.name ?? "Unknown City"}
                                            {m.fullAddress ? ` • ${m.fullAddress}` : ""}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleEdit(m as MandiItem)}
                                            className="cursor-pointer rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#135B47]"
                                            aria-label={`Edit ${m.name}`}
                                        >
                                            <EditIcon size={18} />
                                        </button>
                                        <button
                                            onClick={() => setDeletingMandi(m as MandiItem)}
                                            className="cursor-pointer rounded-xl p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                            aria-label={`Delete ${m.name}`}
                                        >
                                            <TrashIcon size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </AdminLayout>
            </div>
        </>
    )
}
