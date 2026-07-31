import { router, adminProcedure } from "../../trpc"
import { ZCreateVegSchema, ZUpdateVegSchema, ZListVegsSchema } from "./veg.schema"
import { createVeg, updateVeg, listVegs, getAllVegs } from "./veg.controller"

export const vegRouter = router({
    create: adminProcedure.input(ZCreateVegSchema).mutation(createVeg),
    update: adminProcedure.input(ZUpdateVegSchema).mutation(updateVeg),
    list: adminProcedure.input(ZListVegsSchema).query(listVegs),
    getAll: adminProcedure.query(getAllVegs),
})
