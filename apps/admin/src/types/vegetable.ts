import type { RouterInputs, RouterOutputs } from "./api"

export type VegetableItem = RouterOutputs["veg"]["list"]["items"][number]
export type CreateVegetableInput = RouterInputs["veg"]["create"]
export type UpdateVegetableInput = RouterInputs["veg"]["update"]
