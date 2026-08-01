import { router, adminProcedure } from "../../trpc"
import { ZCreateVegSchema, ZUpdateVegSchema, ZListVegsSchema, ZDeleteVegSchema } from "./veg.schema"
import { createVeg, updateVeg, listVegs, getAllVegs, deleteVeg } from "./veg.controller"

export const vegRouter = router({
    create: adminProcedure.input(ZCreateVegSchema).mutation(createVeg),
    update: adminProcedure.input(ZUpdateVegSchema).mutation(updateVeg),
    delete: adminProcedure.input(ZDeleteVegSchema).mutation(deleteVeg),
    list: adminProcedure.input(ZListVegsSchema).query(listVegs),
    getAll: adminProcedure.query(getAllVegs),
})
