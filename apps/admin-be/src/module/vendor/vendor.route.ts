import { router, publicProcedure } from "../../trpc"
import { ZListVendorsSchema, ZCreateVendorSchema, ZGetVendorSchema } from "./vendor.schema"
import { listVendors, createVendor, getVendor } from "./vendor.controller"

export const vendorRouter = router({
    list: publicProcedure.input(ZListVendorsSchema).query(listVendors),
    create: publicProcedure.input(ZCreateVendorSchema).mutation(createVendor),
    get: publicProcedure.input(ZGetVendorSchema).query(getVendor),
})
