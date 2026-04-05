import { router, publicProcedure } from "../../trpc"
import { ZSaveStoreSchema, ZSaveKycSchema } from "./store.schema"
import { saveStore, saveKyc } from "./store.controller"

export const storeRouter = router({
    saveStore: publicProcedure.input(ZSaveStoreSchema).mutation(saveStore),
    saveKyc: publicProcedure.input(ZSaveKycSchema).mutation(saveKyc),
})
