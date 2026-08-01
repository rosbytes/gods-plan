import React, { useState, useMemo } from "react"
import { trpc } from "../lib/trpc"
import { toast } from "sonner"
import { uploadImage } from "../lib/upload"
import { AdminLayout } from "../components/layout"
import {
    Button,
    Input,
    Modal,
    EmptyState,
    SearchIcon,
    PlusIcon,
    TrashIcon,
    SpinnerIcon,
} from "../components/ui"

export interface AssetFileType {
    key: string
    size: number
    lastModified: string
    url: string
    extension: string
    isImage: boolean
}

export default function ManageAssets() {
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<"all" | "images" | "other">("all")
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

    // Modals state
    const [previewAsset, setPreviewAsset] = useState<AssetFileType | null>(null)
    const [renamingAsset, setRenamingAsset] = useState<AssetFileType | null>(null)
    const [newKey, setNewKey] = useState("")
    const [deletingAsset, setDeletingAsset] = useState<AssetFileType | null>(null)

    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    // Fetch Assets directly from S3
    const {
        data: assetData,
        isLoading,
        refetch,
        isRefetching,
    } = trpc.asset.list.useQuery({
        search: searchQuery ? searchQuery : undefined,
    })

    // TRPC Mutations
    const deleteMutation = trpc.asset.delete.useMutation({
        onSuccess: (data) => {
            toast.success(`Asset "${data.key}" deleted from S3`)
            setDeletingAsset(null)
            if (previewAsset?.key === data.key) {
                setPreviewAsset(null)
            }
            refetch()
        },
        onError: (err) => {
            toast.error(err.message || "Failed to delete asset")
        },
    })

    const renameMutation = trpc.asset.rename.useMutation({
        onSuccess: (data) => {
            toast.success("Asset renamed successfully")
            setRenamingAsset(null)
            if (previewAsset && previewAsset.key === data.oldKey) {
                setPreviewAsset({
                    ...previewAsset,
                    key: data.newKey,
                    url: data.url,
                })
            }
            refetch()
        },
        onError: (err) => {
            toast.error(err.message || "Failed to rename asset")
        },
    })

    // Handle Upload File to S3
    const handleUploadFile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedFile) {
            toast.error("Please select a file to upload")
            return
        }

        try {
            setIsUploading(true)
            const uploadedUrl = await uploadImage(selectedFile)
            if (uploadedUrl) {
                toast.success("File uploaded to S3 successfully!")
                setIsUploadOpen(false)
                setSelectedFile(null)
                refetch()
            }
        } catch (error) {
            toast.error("Upload failed")
        } finally {
            setIsUploading(false)
        }
    }

    // Copy URL to Clipboard
    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url)
        toast.success("Asset URL copied to clipboard!")
    }

    // Format bytes to human readable format
    const formatBytes = (bytes: number, decimals = 2) => {
        if (!bytes || bytes === 0) return "0 Bytes"
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
    }

    // Format Date
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    // Filter assets
    const filteredAssets = useMemo(() => {
        if (!assetData?.items) return []
        return assetData.items.filter((asset) => {
            if (filterType === "images") return asset.isImage
            if (filterType === "other") return !asset.isImage
            return true
        })
    }, [assetData, filterType])

    const totalCount = assetData?.items?.length ?? 0
    const imageCount = assetData?.items?.filter((a) => a.isImage).length ?? 0

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                            Asset Gallery (S3 Direct)
                        </h1>
                        <p className="mt-1 text-xs font-medium text-gray-500">
                            View, upload, rename, and delete assets stored directly in your AWS S3
                            bucket.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => refetch()}
                            isLoading={isRefetching}
                            className="inline-flex items-center gap-2"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                            Refresh S3
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setIsUploadOpen(true)}
                            className="inline-flex items-center gap-2"
                        >
                            <PlusIcon size={18} />
                            Upload Asset
                        </Button>
                    </div>
                </div>

                {/* Filter & View Mode Controls */}
                <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    {/* Search Input */}
                    <div className="relative max-w-md flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                            <SearchIcon size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by S3 key or filename..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pr-4 pl-10 text-sm font-semibold text-gray-800 transition-colors focus:border-[#135B47] focus:bg-white focus:outline-none"
                        />
                    </div>

                    {/* Filter Tabs & View Toggle */}
                    <div className="flex items-center gap-3">
                        {/* Type Tabs */}
                        <div className="flex items-center rounded-xl bg-gray-100 p-1">
                            <button
                                onClick={() => setFilterType("all")}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                    filterType === "all"
                                        ? "bg-white text-gray-900 shadow-xs"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                All ({totalCount})
                            </button>
                            <button
                                onClick={() => setFilterType("images")}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                    filterType === "images"
                                        ? "bg-white text-gray-900 shadow-xs"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                Images ({imageCount})
                            </button>
                            <button
                                onClick={() => setFilterType("other")}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                    filterType === "other"
                                        ? "bg-white text-gray-900 shadow-xs"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                Other ({totalCount - imageCount})
                            </button>
                        </div>

                        {/* View Switcher */}
                        <div className="flex items-center rounded-xl bg-gray-100 p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`rounded-lg p-1.5 transition-all ${
                                    viewMode === "grid"
                                        ? "bg-white text-gray-900 shadow-xs"
                                        : "text-gray-400 hover:text-gray-700"
                                }`}
                                title="Grid View"
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <rect x="3" y="3" width="7" height="7" rx="1" />
                                    <rect x="14" y="3" width="7" height="7" rx="1" />
                                    <rect x="14" y="14" width="7" height="7" rx="1" />
                                    <rect x="3" y="14" width="7" height="7" rx="1" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode("table")}
                                className={`rounded-lg p-1.5 transition-all ${
                                    viewMode === "table"
                                        ? "bg-white text-gray-900 shadow-xs"
                                        : "text-gray-400 hover:text-gray-700"
                                }`}
                                title="Table View"
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <line x1="8" y1="6" x2="21" y2="6" />
                                    <line x1="8" y1="12" x2="21" y2="12" />
                                    <line x1="8" y1="18" x2="21" y2="18" />
                                    <line x1="3" y1="6" x2="3.01" y2="6" />
                                    <line x1="3" y1="12" x2="3.01" y2="12" />
                                    <line x1="3" y1="18" x2="3.01" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center rounded-2xl bg-white shadow-xs">
                        <div className="flex items-center gap-3 text-sm font-semibold text-gray-400">
                            <SpinnerIcon size={24} />
                            Fetching assets from S3 bucket...
                        </div>
                    </div>
                ) : filteredAssets.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 shadow-xs">
                        <EmptyState
                            title="No Assets Found in S3"
                            description={
                                searchQuery
                                    ? `No S3 assets matching "${searchQuery}"`
                                    : "Upload your first asset to AWS S3 bucket to get started."
                            }
                            action={
                                <Button variant="primary" onClick={() => setIsUploadOpen(true)}>
                                    Upload Asset
                                </Button>
                            }
                        />
                    </div>
                ) : viewMode === "grid" ? (
                    /* Grid Layout */
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {filteredAssets.map((asset) => (
                            <div
                                key={asset.key}
                                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs transition-all hover:border-gray-300 hover:shadow-md"
                            >
                                {/* Thumbnail */}
                                <div
                                    onClick={() => setPreviewAsset(asset)}
                                    className="relative aspect-square w-full cursor-pointer overflow-hidden bg-gray-50"
                                >
                                    {asset.isImage ? (
                                        <img
                                            src={asset.url}
                                            alt={asset.key}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center p-4 text-gray-400">
                                            <svg
                                                width="40"
                                                height="40"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                            >
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                            <span className="mt-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                                                {asset.extension || "FILE"}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />

                                    {/* Extension Badge */}
                                    <span className="absolute top-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase backdrop-blur-xs">
                                        {asset.extension || "file"}
                                    </span>
                                </div>

                                {/* Content & Actions */}
                                <div className="flex flex-1 flex-col justify-between p-3">
                                    <div>
                                        <h4
                                            className="truncate text-xs font-bold text-gray-800"
                                            title={asset.key}
                                        >
                                            {asset.key.split("/").pop()}
                                        </h4>
                                        <p className="mt-1 text-[11px] font-medium text-gray-400">
                                            {formatBytes(asset.size)}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2">
                                        <button
                                            onClick={() => handleCopyUrl(asset.url)}
                                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                            title="Copy S3 URL"
                                        >
                                            <svg
                                                width="15"
                                                height="15"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <rect
                                                    x="9"
                                                    y="9"
                                                    width="13"
                                                    height="13"
                                                    rx="2"
                                                    ry="2"
                                                />
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setRenamingAsset(asset)
                                                setNewKey(asset.key)
                                            }}
                                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                            title="Rename S3 Key"
                                        >
                                            <svg
                                                width="15"
                                                height="15"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setDeletingAsset(asset)}
                                            className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                                            title="Delete from S3"
                                        >
                                            <TrashIcon size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Table Layout */
                    <div className="overflow-hidden rounded-2xl bg-white shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                                    <tr>
                                        <th className="px-5 py-3.5">Asset</th>
                                        <th className="px-5 py-3.5">S3 Key</th>
                                        <th className="px-5 py-3.5">Size</th>
                                        <th className="px-5 py-3.5">Last Modified</th>
                                        <th className="px-5 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-medium">
                                    {filteredAssets.map((asset) => (
                                        <tr
                                            key={asset.key}
                                            className="transition-colors hover:bg-gray-50/50"
                                        >
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        onClick={() => setPreviewAsset(asset)}
                                                        className="h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-gray-100"
                                                    >
                                                        {asset.isImage ? (
                                                            <img
                                                                src={asset.url}
                                                                alt={asset.key}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center font-bold text-gray-400">
                                                                {asset.extension.toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-gray-800">
                                                        {asset.key.split("/").pop()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="max-w-xs truncate px-5 py-3 font-mono text-[11px] text-gray-500">
                                                {asset.key}
                                            </td>
                                            <td className="px-5 py-3 text-gray-600">
                                                {formatBytes(asset.size)}
                                            </td>
                                            <td className="px-5 py-3 text-gray-500">
                                                {formatDate(asset.lastModified)}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleCopyUrl(asset.url)}
                                                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                                        title="Copy URL"
                                                    >
                                                        <svg
                                                            width="15"
                                                            height="15"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        >
                                                            <rect
                                                                x="9"
                                                                y="9"
                                                                width="13"
                                                                height="13"
                                                                rx="2"
                                                                ry="2"
                                                            />
                                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setRenamingAsset(asset)
                                                            setNewKey(asset.key)
                                                        }}
                                                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                                        title="Rename Key"
                                                    >
                                                        <svg
                                                            width="15"
                                                            height="15"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        >
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingAsset(asset)}
                                                        className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                                                        title="Delete Asset"
                                                    >
                                                        <TrashIcon size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Upload Asset Modal */}
                <Modal
                    isOpen={isUploadOpen}
                    onClose={() => setIsUploadOpen(false)}
                    title="Upload Asset to S3"
                    subtitle="Select a file to upload directly into your AWS S3 bucket."
                >
                    <form onSubmit={handleUploadFile} className="space-y-4 pt-2">
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center transition-colors hover:border-gray-400">
                            <svg
                                width="40"
                                height="40"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#9ca3af"
                                strokeWidth="1.5"
                                className="mb-3"
                            >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <input
                                type="file"
                                id="asset-file-input"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                className="hidden"
                            />
                            <label
                                htmlFor="asset-file-input"
                                className="cursor-pointer rounded-xl bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-100"
                            >
                                {selectedFile ? selectedFile.name : "Choose File"}
                            </label>
                            {selectedFile ? (
                                <p className="mt-2 text-xs font-semibold text-emerald-600">
                                    Selected: {selectedFile.name} ({formatBytes(selectedFile.size)})
                                </p>
                            ) : (
                                <p className="mt-2 text-xs font-medium text-gray-400">
                                    Supports PNG, JPG, WEBP, SVG, PDF up to 10MB
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                fullWidth
                                onClick={() => setIsUploadOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                isLoading={isUploading}
                                disabled={!selectedFile}
                            >
                                Upload to S3
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Preview Asset Modal */}
                <Modal
                    isOpen={Boolean(previewAsset)}
                    onClose={() => setPreviewAsset(null)}
                    title="Asset Preview & Details"
                    maxWidth="lg"
                >
                    {previewAsset && (
                        <div className="space-y-5 pt-1">
                            {/* Preview Area */}
                            <div className="flex max-h-80 w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-100 p-2">
                                {previewAsset.isImage ? (
                                    <img
                                        src={previewAsset.url}
                                        alt={previewAsset.key}
                                        className="max-h-76 w-auto max-w-full rounded-xl object-contain shadow-sm"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center p-8 text-gray-400">
                                        <svg
                                            width="48"
                                            height="48"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                        >
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                        <span className="mt-2 text-sm font-bold uppercase">
                                            {previewAsset.extension} File
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Details List */}
                            <div className="space-y-3 rounded-2xl bg-gray-50 p-4 text-xs font-semibold">
                                <div className="flex justify-between border-b border-gray-200/60 pb-2">
                                    <span className="text-gray-400">S3 Key:</span>
                                    <span className="font-mono text-gray-800">
                                        {previewAsset.key}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200/60 pb-2">
                                    <span className="text-gray-400">File Size:</span>
                                    <span className="text-gray-800">
                                        {formatBytes(previewAsset.size)}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200/60 pb-2">
                                    <span className="text-gray-400">Last Modified:</span>
                                    <span className="text-gray-800">
                                        {formatDate(previewAsset.lastModified)}
                                    </span>
                                </div>
                                <div>
                                    <span className="mb-1 block text-gray-400">Public S3 URL:</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={previewAsset.url}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 font-mono text-[11px] text-gray-700"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCopyUrl(previewAsset.url)}
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    fullWidth
                                    onClick={() => window.open(previewAsset.url, "_blank")}
                                >
                                    Open Direct Link
                                </Button>
                                <Button
                                    variant="danger"
                                    fullWidth
                                    onClick={() => {
                                        setDeletingAsset(previewAsset)
                                    }}
                                >
                                    Delete Asset
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Rename Asset Modal */}
                <Modal
                    isOpen={Boolean(renamingAsset)}
                    onClose={() => setRenamingAsset(null)}
                    title="Rename S3 Asset Key"
                    subtitle={`Renaming object in bucket "${renamingAsset?.key}"`}
                >
                    {renamingAsset && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                renameMutation.mutate({
                                    oldKey: renamingAsset.key,
                                    newKey: newKey.trim(),
                                })
                            }}
                            className="space-y-4 pt-2"
                        >
                            <Input
                                label="New S3 Key Name"
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value)}
                                required
                            />
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    fullWidth
                                    onClick={() => setRenamingAsset(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    isLoading={renameMutation.isPending}
                                >
                                    Rename Key
                                </Button>
                            </div>
                        </form>
                    )}
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={Boolean(deletingAsset)}
                    onClose={() => setDeletingAsset(null)}
                    title="Confirm Permanent Deletion"
                    subtitle="This will permanently delete the file directly from AWS S3."
                >
                    {deletingAsset && (
                        <div className="space-y-4">
                            <p className="text-xs font-semibold text-gray-600">
                                Are you sure you want to delete{" "}
                                <strong className="text-gray-900">{deletingAsset.key}</strong>? This
                                action cannot be undone.
                            </p>
                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    fullWidth
                                    onClick={() => setDeletingAsset(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    fullWidth
                                    isLoading={deleteMutation.isPending}
                                    onClick={() =>
                                        deleteMutation.mutate({ key: deletingAsset.key })
                                    }
                                >
                                    Delete from S3
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </AdminLayout>
    )
}
