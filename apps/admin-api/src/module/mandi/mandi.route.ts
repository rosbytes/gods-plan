import { router, adminProcedure } from "../../trpc"
import { ZCreateMandiSchema, ZUpdateMandiSchema, ZListMandisSchema } from "./mandi.schema"
import { createMandi, updateMandi, listMandis, listAllMandis } from "./mandi.controller"

export const mandiRouter = router({
    create: adminProcedure.input(ZCreateMandiSchema).mutation(createMandi),
    update: adminProcedure.input(ZUpdateMandiSchema).mutation(updateMandi),
    list: adminProcedure.input(ZListMandisSchema).query(listMandis),
    listAllMandi: adminProcedure.query(listAllMandis),
})
