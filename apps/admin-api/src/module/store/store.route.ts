import { router, publicProcedure } from "../../trpc"
import { ZSaveStoreSchema, ZSaveKycSchema, ZGetKycSchema } from "./store.schema"
import { saveStore, saveKyc, getKyc } from "./store.controller"

export const storeRouter = router({
    saveStore: publicProcedure.input(ZSaveStoreSchema).mutation(saveStore),
    saveKyc: publicProcedure.input(ZSaveKycSchema).mutation(saveKyc),
    getKyc: publicProcedure.input(ZGetKycSchema).query(getKyc),
})
