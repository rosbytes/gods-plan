import { router, adminProcedure } from "../../trpc"
import {
    ZSignAgreementSchema,
    ZGetStoreAgreementSchema,
    ZGetAgreementByIdSchema,
} from "./agreement.schema"
import { signAgreement, getStoreAgreement, getAgreementById } from "./agreement.controller"

export const agreementRouter = router({
    sign: adminProcedure.input(ZSignAgreementSchema).mutation(signAgreement),
    getByStore: adminProcedure.input(ZGetStoreAgreementSchema).query(getStoreAgreement),
    getById: adminProcedure.input(ZGetAgreementByIdSchema).query(getAgreementById),
})
