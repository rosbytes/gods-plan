import type { RouterInputs, RouterOutputs } from "./api"

export type CityItem = RouterOutputs["city"]["list"]["items"][number]
export type CreateCityInput = RouterInputs["city"]["create"]
export type UpdateCityInput = RouterInputs["city"]["update"]
