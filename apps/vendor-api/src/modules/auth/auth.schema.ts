import { z } from "zod"

export const ZLoginSchema = z.object({
    phone: z.string().min(10).max(15),
    pin: z.string().length(4),
})

export type TLoginSchema = z.infer<typeof ZLoginSchema>
