import jwt from "jsonwebtoken"
import { env } from "../configs"

/*
 *
 *   Admin Access & Refresh Token
 *
 * */
export const generateAdminAccessToken = (id: string) => {
    return jwt.sign({ id }, env.ADMIN_JWT_ACCESS_TOKEN_SECRET, {
        expiresIn: env.ADMIN_JWT_ACCESS_TOKEN_EXPIRY as any,
    })
}

export const generateAdminRefreshToken = (id: string) => {
    return jwt.sign({ id }, env.ADMIN_JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: env.ADMIN_JWT_REFRESH_TOKEN_EXPIRY as any,
    })
}

export const verifyAdminAccessToken = (token: string) => {
    return jwt.verify(token, env.ADMIN_JWT_ACCESS_TOKEN_SECRET) as { id: string }
}

export const verifyAdminRefreshToken = (token: string) => {
    return jwt.verify(token, env.ADMIN_JWT_REFRESH_TOKEN_SECRET) as { id: string }
}
