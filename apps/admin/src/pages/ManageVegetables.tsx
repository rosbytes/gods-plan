import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { uploadImage } from "../lib/upload"
import type { VegetableItem } from "../types"
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

export default function ManageVegetables() {
    const navigate = useNavigate()
    const [showForm, setShowForm] = useState(false)

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
        <div className="min-h-screen bg-[#F5F6F8] pb-28 font-sans text-gray-900">
            <PageHeader
                title="Manage Vegetables"
                subtitle="View and manage cataloged fresh produce items"
                onBack={() => navigate("/dashboard")}
                actions={
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

            <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
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
                            <Button variant="outline" fullWidth onClick={() => setEditingVeg(null)}>
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

                {/* List Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
                        All Vegetables {vegetables?.items ? `(${vegetables.items.length})` : ""}
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12 text-gray-400">
                        <SpinnerIcon size={24} className="text-[#135B47]" />
                    </div>
                ) : vegetables?.items?.length === 0 ? (
                    <EmptyState
                        title="No Vegetables Cataloged"
                        description="Click the button above to add produce items."
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
                        {vegetables?.items?.map((v) => (
                            <div
                                key={v.id}
                                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs transition-all hover:shadow-md"
                            >
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-emerald-50">
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
                                    <span className="truncate text-[16px] font-bold tracking-tight text-gray-800">
                                        {v.name}
                                    </span>
                                    <span className="mt-0.5 truncate text-[13px] font-medium text-gray-400">
                                        {v.nameInHindi ? `${v.nameInHindi}` : "No Hindi name"}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleEdit(v as VegetableItem)}
                                    className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#135B47]"
                                    aria-label={`Edit ${v.name}`}
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
