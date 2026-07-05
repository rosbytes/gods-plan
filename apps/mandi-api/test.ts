import z from "zod"

const pin = z.coerce.number().min(0).max(9999)

console.log(pin.parse("0002"))

import * as jadu from "./play"
console.log(jadu)
