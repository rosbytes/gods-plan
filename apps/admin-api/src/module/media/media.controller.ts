import { Request, Response } from "express"
import multer from "multer"
import { cloudinary } from "../../configs"
import { logger } from "../../configs"

// Multer storage in memory
const storage = multer.memoryStorage()
export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
})

export const uploadMedia = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" })
        }

        // Convert buffer to base64 data URI
        const b64 = Buffer.from(req.file.buffer).toString("base64")
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64

        // Upload to Cloudinary
        const result = await cloudinary.v2.uploader.upload(dataURI, {
            folder: "ros/kyc",
            resource_type: "auto",
        })

        logger.info(`Cloudinary Upload Success: ${result.secure_url}`)
        return res.status(200).json({ success: true, url: result.secure_url })
    } catch (error) {
        logger.error("Media Upload Error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        })
    }
}
