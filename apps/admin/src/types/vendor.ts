import type { RouterInputs, RouterOutputs } from "./api"
import type { VendorType } from "../constants/vendor"

export type { VendorType }

export type VendorItem = RouterOutputs["vendor"]["listAllVendors"]["items"][number]
