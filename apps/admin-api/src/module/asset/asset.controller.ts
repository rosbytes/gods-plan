import { TRPCError } from "@trpc/server"
import { ListObjectsV2Command, DeleteObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3"
import { s3, S3_BUCKET_NAME, env, logger } from "../../configs"
import type { TListAssetsSchema, TDeleteAssetSchema, TRenameAssetSchema } from "./asset.schema"

export async function listAssets({ input }: { input: TListAssetsSchema }) {
    try {
        const command = new ListObjectsV2Command({
            Bucket: S3_BUCKET_NAME,
            Prefix: input.prefix || undefined,
            ContinuationToken: input.cursor || undefined,
            MaxKeys: input.limit,
        })

        const response = await s3.send(command)

        let items = (response.Contents || [])
            .filter((item) => item.Key && !item.Key.endsWith("/"))
            .map((item) => {
                const key = item.Key!
                const url = `https://${S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`
                const extension = key.split(".").pop()?.toLowerCase() || ""
                const isImage = [
                    "jpg",
                    "jpeg",
                    "png",
                    "webp",
                    "gif",
                    "svg",
                    "ico",
                    "avif",
                ].includes(extension)

                return {
                    key,
                    size: item.Size || 0,
                    lastModified: item.LastModified
                        ? item.LastModified.toISOString()
                        : new Date().toISOString(),
                    url,
                    extension,
                    isImage,
                }
            })

        if (input.search) {
            const query = input.search.toLowerCase()
            items = items.filter((item) => item.key.toLowerCase().includes(query))
        }

        return {
            items,
            nextCursor: response.NextContinuationToken || null,
            isTruncated: response.IsTruncated || false,
            totalCount: items.length,
        }
    } catch (error) {
        logger.error("List S3 Assets Error:", error)
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Failed to fetch assets from S3",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function deleteAsset({ input }: { input: TDeleteAssetSchema }) {
    try {
        const command = new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: input.key,
        })

        await s3.send(command)
        logger.info(`Deleted S3 Asset: ${input.key}`)
        return { success: true, key: input.key }
    } catch (error) {
        logger.error("Delete S3 Asset Error:", error)
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Failed to delete asset from S3",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}

export async function renameAsset({ input }: { input: TRenameAssetSchema }) {
    try {
        if (input.oldKey === input.newKey) {
            return {
                success: true,
                oldKey: input.oldKey,
                newKey: input.newKey,
                url: `https://${S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${input.newKey}`,
            }
        }

        // Copy object to new key in S3
        const copyCommand = new CopyObjectCommand({
            Bucket: S3_BUCKET_NAME,
            CopySource: `${S3_BUCKET_NAME}/${input.oldKey}`,
            Key: input.newKey,
        })
        await s3.send(copyCommand)

        // Delete old object from S3
        const deleteCommand = new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: input.oldKey,
        })
        await s3.send(deleteCommand)

        logger.info(`Renamed S3 Asset from ${input.oldKey} to ${input.newKey}`)
        const newUrl = `https://${S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${input.newKey}`
        return { success: true, oldKey: input.oldKey, newKey: input.newKey, url: newUrl }
    } catch (error) {
        logger.error("Rename S3 Asset Error:", error)
        throw new TRPCError({
            message: error instanceof Error ? error.message : "Failed to rename asset in S3",
            code: "INTERNAL_SERVER_ERROR",
        })
    }
}
