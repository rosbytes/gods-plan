import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { uploadImage } from "../lib/upload"
import type { MandiItem } from "../types"
import {
    PageHeader,
    Button,
    Input,
    Modal,
    ImageUploader,
    EmptyState,
    PlusIcon,
    EditIcon,
    LocationIcon,
    SpinnerIcon,
} from "../components/ui"

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

    // Edit state
    const [editingMandi, setEditingMandi] = useState<MandiItem | null>(null)
    const [editName, setEditName] = useState("")
    const [editCityId, setEditCityId] = useState("")
    const [editLat, setEditLat] = useState("")
    const [editLng, setEditLng] = useState("")
    const [editFullAddress, setEditFullAddress] = useState("")
    const [editImageFile, setEditImageFile] = useState<File | null>(null)

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

    const isFormValid = name.trim() !== "" && cityId !== "" && lat !== "" && lng !== ""
    const isEditValid =
        editName.trim() !== "" && editCityId !== "" && editLat !== "" && editLng !== ""
    const isPending = createMutation.isPending || updateMutation.isPending || uploading

    return (
        <div className="min-h-screen bg-[#F5F6F8] pb-28 font-sans text-gray-900">
            <PageHeader
                title="Manage Mandis"
                subtitle="View and manage wholesale agricultural mandis"
                onBack={() => navigate("/dashboard")}
                actions={
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

            <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
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
                                    {isFetchingLocation ? "Fetching..." : "Get Current Location"}
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
                            <Button variant="outline" fullWidth onClick={() => setShowForm(false)}>
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
                                    {isFetchingLocation ? "Fetching..." : "Get Current Location"}
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

                {/* Mandis List Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
                        All Mandis {mandis?.items ? `(${mandis.items.length})` : ""}
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12 text-gray-400">
                        <SpinnerIcon size={24} className="text-[#135B47]" />
                    </div>
                ) : mandis?.items?.length === 0 ? (
                    <EmptyState
                        title="No Mandis Registered"
                        description="Click the button above to register your first mandi."
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
                        {mandis?.items?.map((m) => (
                            <div
                                key={m.id}
                                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs transition-all hover:shadow-md"
                            >
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-emerald-50">
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
                                    <span className="truncate text-[16px] font-bold tracking-tight text-gray-800">
                                        {m.name}
                                    </span>
                                    <span className="mt-0.5 truncate text-[13px] font-medium text-gray-400">
                                        {m.city?.name ?? "Unknown City"}
                                        {m.fullAddress ? ` • ${m.fullAddress}` : ""}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleEdit(m as MandiItem)}
                                    className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#135B47]"
                                    aria-label={`Edit ${m.name}`}
                                >
                                    <EditIcon size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
