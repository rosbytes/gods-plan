import React from "react"
import { ImageIcon } from "../common/Icons"

export interface ImageUploaderProps {
    label?: string
    selectedFile: File | null
    onFileSelect: (file: File | null) => void
    accept?: string
    placeholder?: string
}

export function ImageUploader({
    label = "Upload Image",
    selectedFile,
    onFileSelect,
    accept = "image/*",
    placeholder = "Choose an image file",
}: ImageUploaderProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        onFileSelect(file)
    }

    return (
        <div className="w-full">
            {label && (
                <label className="mb-1.5 block text-xs font-medium text-gray-500">{label}</label>
            )}
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-[#135B47] hover:bg-emerald-50/30">
                <ImageIcon size={20} className="text-[#135B47]" />
                <span className="truncate">{selectedFile ? selectedFile.name : placeholder}</span>
                <input type="file" accept={accept} className="hidden" onChange={handleFileChange} />
            </label>
        </div>
    )
}
