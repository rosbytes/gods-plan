import type { RouterInputs, RouterOutputs } from "./api"

export type MandiItem = RouterOutputs["mandi"]["list"]["items"][number]
export type CreateMandiInput = RouterInputs["mandi"]["create"]
export type UpdateMandiInput = RouterInputs["mandi"]["update"]
