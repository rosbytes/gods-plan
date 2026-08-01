import { router, adminProcedure } from "../../trpc"
import {
    ZCreateMandiSchema,
    ZUpdateMandiSchema,
    ZListMandisSchema,
    ZDeleteMandiSchema,
} from "./mandi.schema"
import {
    createMandi,
    updateMandi,
    listMandis,
    listAllMandis,
    deleteMandi,
} from "./mandi.controller"

export const mandiRouter = router({
    create: adminProcedure.input(ZCreateMandiSchema).mutation(createMandi),
    update: adminProcedure.input(ZUpdateMandiSchema).mutation(updateMandi),
    delete: adminProcedure.input(ZDeleteMandiSchema).mutation(deleteMandi),
    list: adminProcedure.input(ZListMandisSchema).query(listMandis),
    listAllMandi: adminProcedure.query(listAllMandis),
})
