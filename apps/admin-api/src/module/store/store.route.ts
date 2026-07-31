import { router, adminProcedure } from "../../trpc"
import {
    ZSaveStoreSchema,
    ZSaveKycSchema,
    ZGetKycSchema,
    ZCreateMandiStoreSchema,
    ZUpdateMandiStoreSchema,
    ZCreateMarketStoreSchema,
    ZUpdateMarketStoreSchema,
    ZSaveMandiStoreKycSchema,
    ZSaveMarketStoreKycSchema,
} from "./store.schema"
import {
    saveStore,
    saveKyc,
    getKyc,
    createMandiStore,
    createMarketStore,
    updateMandiStore,
    updateMarketStore,
    saveMandiStoreKyc,
    saveMarketStoreKyc,
} from "./store.controller"

export const storeRouter = router({
    saveStore: adminProcedure.input(ZSaveStoreSchema).mutation(saveStore),
    // Mandi Store
    createMandiStore: adminProcedure.input(ZCreateMandiStoreSchema).mutation(createMandiStore),
    updateMandiStore: adminProcedure.input(ZUpdateMandiStoreSchema).mutation(updateMandiStore),
    // Market Store
    createMarketStore: adminProcedure.input(ZCreateMarketStoreSchema).mutation(createMarketStore),
    updateMarketStore: adminProcedure.input(ZUpdateMarketStoreSchema).mutation(updateMarketStore),
    // Kyc Routes
    saveMarketKyc: adminProcedure.input(ZSaveMarketStoreKycSchema).mutation(saveMarketStoreKyc),
    saveMandiKyc: adminProcedure.input(ZSaveMandiStoreKycSchema).mutation(saveMandiStoreKyc),
    //
    getKyc: adminProcedure.input(ZGetKycSchema).query(getKyc),
    // saveKyc: adminProcedure.input(ZSaveKycSchema).mutation(saveKyc),
})
