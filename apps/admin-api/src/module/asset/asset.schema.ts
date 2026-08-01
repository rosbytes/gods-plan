import { z } from "zod"

export const ZListAssetsSchema = z.object({
    prefix: z.string().optional(),
    search: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.number().min(1).max(1000).default(500),
})
export type TListAssetsSchema = z.infer<typeof ZListAssetsSchema>

export const ZDeleteAssetSchema = z.object({
    key: z.string().min(1, "Asset key is required"),
})
export type TDeleteAssetSchema = z.infer<typeof ZDeleteAssetSchema>

export const ZRenameAssetSchema = z.object({
    oldKey: z.string().min(1, "Old asset key is required"),
    newKey: z.string().min(1, "New asset key is required"),
})
export type TRenameAssetSchema = z.infer<typeof ZRenameAssetSchema>
