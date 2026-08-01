import { router, adminProcedure } from "../../trpc"
import {
    ZCreateCitySchema,
    ZUpdateCitySchema,
    ZListCitiesSchema,
    ZDeleteCitySchema,
} from "./city.schema"
import { createCity, updateCity, listCities, deleteCity } from "./city.controller"

export const cityRouter = router({
    create: adminProcedure.input(ZCreateCitySchema).mutation(createCity),
    update: adminProcedure.input(ZUpdateCitySchema).mutation(updateCity),
    delete: adminProcedure.input(ZDeleteCitySchema).mutation(deleteCity),
    list: adminProcedure.input(ZListCitiesSchema).query(listCities),
})
