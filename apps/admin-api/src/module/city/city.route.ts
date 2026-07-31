import { router, adminProcedure } from "../../trpc"
import { ZCreateCitySchema, ZUpdateCitySchema, ZListCitiesSchema } from "./city.schema"
import { createCity, updateCity, listCities } from "./city.controller"

export const cityRouter = router({
    create: adminProcedure.input(ZCreateCitySchema).mutation(createCity),
    update: adminProcedure.input(ZUpdateCitySchema).mutation(updateCity),
    list: adminProcedure.input(ZListCitiesSchema).query(listCities),
})
