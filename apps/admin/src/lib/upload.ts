import { customFetch } from "./customFetch"
import { toast } from "sonner"

/**
 * Uploads an image file to the media API endpoint and returns the image URL.
 * @param file File object to upload
 * @returns Promise resolving to the image URL string, or undefined if upload fails
 */
export async function uploadImage(file: File): Promise<string | undefined> {
    try {
        const formData = new FormData()
        formData.append("file", file)
        const apiUrl = import.meta.env.VITE_API_URL || ""
        const res = await customFetch(`${apiUrl}/api/media/upload`, {
            method: "POST",
            body: formData,
        })
        const data = await res.json()
        if (data.success) {
            return data.url as string
        }
        toast.error(`Upload failed: ${data.message || "Unknown error"}`)
    } catch (err) {
        console.error("Image upload error:", err)
        toast.error("Image upload failed — network error")
    }
    return undefined
}
