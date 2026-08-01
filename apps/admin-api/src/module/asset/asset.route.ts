import { router, adminProcedure } from "../../trpc"
import { ZListAssetsSchema, ZDeleteAssetSchema, ZRenameAssetSchema } from "./asset.schema"
import { listAssets, deleteAsset, renameAsset } from "./asset.controller"

export const assetRouter = router({
    list: adminProcedure.input(ZListAssetsSchema).query(listAssets),
    delete: adminProcedure.input(ZDeleteAssetSchema).mutation(deleteAsset),
    rename: adminProcedure.input(ZRenameAssetSchema).mutation(renameAsset),
})
