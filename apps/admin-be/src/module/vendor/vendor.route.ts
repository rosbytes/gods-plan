import { router, publicProcedure } from "../../trpc"
import { ZListVendorsSchema, ZCreateVendorSchema } from "./vendor.schema"
import { listVendors, createVendor } from "./vendor.controller"

export const vendorRouter = router({
    list: publicProcedure.input(ZListVendorsSchema).query(listVendors),
    create: publicProcedure.input(ZCreateVendorSchema).mutation(createVendor),
})
