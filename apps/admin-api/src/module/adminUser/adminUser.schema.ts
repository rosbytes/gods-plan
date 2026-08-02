import { z } from "zod"

export const ZAdminRoleSchema = z.enum(["admin", "super_admin", "operator"])
export type TAdminRole = z.infer<typeof ZAdminRoleSchema>

export const ZCreateAdminUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(10, "Valid 10-digit phone number is required"),
    email: z.email("Invalid email format").optional().or(z.literal("")),
    pin: z.string().length(4, "PIN must be exactly 4 digits"),
    role: ZAdminRoleSchema.default("admin"),
})
export type TCreateAdminUserSchema = z.infer<typeof ZCreateAdminUserSchema>

export const ZUpdateAdminUserSchema = z.object({
    id: z.uuid("Invalid admin ID"),
    name: z.string().min(1).optional(),
    phone: z.string().min(10).optional(),
    email: z.email().optional().or(z.literal("")),
    pin: z.string().length(4).optional(),
    role: ZAdminRoleSchema.optional(),
    isActive: z.boolean().optional(),
})
export type TUpdateAdminUserSchema = z.infer<typeof ZUpdateAdminUserSchema>

export const ZListAdminUsersSchema = z.object({
    search: z.string().optional(),
})
export type TListAdminUsersSchema = z.infer<typeof ZListAdminUsersSchema>

export const ZDeleteAdminUserSchema = z.object({
    id: z.uuid("Invalid admin ID"),
})
export type TDeleteAdminUserSchema = z.infer<typeof ZDeleteAdminUserSchema>
