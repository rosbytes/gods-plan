import { router, adminProcedure } from "../../trpc"
import {
    ZListVendorsSchema,
    ZCreateMarketVendorSchema,
    ZCreateMandiVendorSchema,
    ZGetVendorSchema,
} from "./vendor.schema"
import {
    listMarketVendors,
    listMandiVendors,
    createMarketVendor,
    createMandiVendor,
    getMarketVendor,
    getMandiVendor,
    listVendors,
} from "./vendor.controller"

export const vendorRouter = router({
    listMarket: adminProcedure.input(ZListVendorsSchema).query(listMarketVendors),
    listMandi: adminProcedure.input(ZListVendorsSchema).query(listMandiVendors),
    listAllVendors: adminProcedure.input(ZListVendorsSchema).query(listVendors),
    createMarket: adminProcedure.input(ZCreateMarketVendorSchema).mutation(createMarketVendor),
    createMandi: adminProcedure.input(ZCreateMandiVendorSchema).mutation(createMandiVendor),
    getMarket: adminProcedure.input(ZGetVendorSchema).query(getMarketVendor),
    getMandi: adminProcedure.input(ZGetVendorSchema).query(getMandiVendor),
})
