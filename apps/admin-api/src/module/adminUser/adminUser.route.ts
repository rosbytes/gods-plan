import { router, adminProcedure } from "../../trpc"
import {
    ZCreateAdminUserSchema,
    ZUpdateAdminUserSchema,
    ZListAdminUsersSchema,
    ZDeleteAdminUserSchema,
} from "./adminUser.schema"
import {
    createAdminUser,
    updateAdminUser,
    listAdminUsers,
    deleteAdminUser,
} from "./adminUser.controller"

export const adminUserRouter = router({
    create: adminProcedure.input(ZCreateAdminUserSchema).mutation(createAdminUser),
    update: adminProcedure.input(ZUpdateAdminUserSchema).mutation(updateAdminUser),
    delete: adminProcedure.input(ZDeleteAdminUserSchema).mutation(deleteAdminUser),
    list: adminProcedure.input(ZListAdminUsersSchema).query(listAdminUsers),
})
