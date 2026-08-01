import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { uploadImage } from "../lib/upload"
import type { CityItem } from "../types"
import {
    PageHeader,
    Button,
    Input,
    Modal,
    ImageUploader,
    EmptyState,
    PlusIcon,
    EditIcon,
    SpinnerIcon,
} from "../components/ui"

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
        <div className="min-h-screen bg-[#F5F6F8] pb-28 font-sans text-gray-900">
            <PageHeader
                title="Manage Cities"
                subtitle="View and manage available service locations"
                onBack={() => navigate("/dashboard")}
                actions={
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

            <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
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

                {/* Cities List Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
                        All Cities {cities?.items ? `(${cities.items.length})` : ""}
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12 text-gray-400">
                        <SpinnerIcon size={24} className="text-[#135B47]" />
                    </div>
                ) : cities?.items?.length === 0 ? (
                    <EmptyState
                        title="No Cities Added Yet"
                        description="Click the button above to add your first city."
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
                        {cities?.items?.map((c) => (
                            <div
                                key={c.id}
                                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs transition-all hover:shadow-md"
                            >
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-emerald-50">
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
                                    aria-label={`Edit ${c.name}`}
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
