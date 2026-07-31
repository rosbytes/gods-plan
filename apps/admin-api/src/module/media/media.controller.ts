import { Request, Response } from "express"
import multer from "multer"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3, S3_BUCKET_NAME, logger, env } from "../../configs"
import crypto from "crypto"

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

        // Generate unique file key
        const ext = req.file.originalname.split(".").pop() || "jpg"
        const key = `ros/admin/${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`

        logger.info(`Uploading to S3: bucket=${S3_BUCKET_NAME}, key=${key}, size=${req.file.size}`)

        // Upload to S3
        await s3.send(
            new PutObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: key,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            }),
        )

        // Construct the public URL (regional endpoint for non-us-east-1 buckets)
        const url = `https://${S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`

        logger.info(`S3 Upload Success: ${url}`)
        return res.status(200).json({ success: true, url })
    } catch (error) {
        logger.error("Media Upload Error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        })
    }
}
