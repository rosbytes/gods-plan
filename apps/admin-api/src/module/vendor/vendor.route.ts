import { router, adminProcedure } from "../../trpc"
import {
    ZListVendorsSchema,
    ZCreateMarketVendorSchema,
    ZCreateMandiVendorSchema,
    ZGetVendorSchema,
    ZDeleteVendorSchema,
} from "./vendor.schema"
import {
    listMarketVendors,
    listMandiVendors,
    createMarketVendor,
    createMandiVendor,
    getMarketVendor,
    getMandiVendor,
    getVendor,
    listVendors,
    deleteVendor,
} from "./vendor.controller"

export const vendorRouter = router({
    listMarket: adminProcedure.input(ZListVendorsSchema).query(listMarketVendors),
    listMandi: adminProcedure.input(ZListVendorsSchema).query(listMandiVendors),
    listAllVendors: adminProcedure.input(ZListVendorsSchema).query(listVendors),
    createMarket: adminProcedure.input(ZCreateMarketVendorSchema).mutation(createMarketVendor),
    createMandi: adminProcedure.input(ZCreateMandiVendorSchema).mutation(createMandiVendor),
    getMarket: adminProcedure.input(ZGetVendorSchema).query(getMarketVendor),
    getMandi: adminProcedure.input(ZGetVendorSchema).query(getMandiVendor),
    getVendor: adminProcedure.input(ZGetVendorSchema).query(getVendor),
    getById: adminProcedure.input(ZGetVendorSchema).query(getVendor),
    delete: adminProcedure.input(ZDeleteVendorSchema).mutation(deleteVendor),
})
