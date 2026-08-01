import type { RouterOutputs, RouterInputs } from "./api"

export type AdminUserItem = RouterOutputs["adminUser"]["list"]["items"][number]
export type CreateAdminUserInput = RouterInputs["adminUser"]["create"]
export type UpdateAdminUserInput = RouterInputs["adminUser"]["update"]
