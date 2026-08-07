import jwt from "jsonwebtoken"
import { env } from "../configs"

/*
 *
 *    Access & Refresh Token
 *
 * */
export const generateAccessToken = ({ id }: { id: string }) => {
    return jwt.sign({ id }, env.MARKET_JWT_ACCESS_TOKEN_SECRET, {
        expiresIn: env.MARKET_JWT_ACCESS_TOKEN_EXPIRY as any,
    })
}

export const generateRefreshToken = ({ id }: { id: string }) => {
    return jwt.sign({ id }, env.MARKET_JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: env.MARKET_JWT_REFRESH_TOKEN_EXPIRY as any,
    })
}

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, env.MARKET_JWT_ACCESS_TOKEN_SECRET) as { id: string }
}

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, env.MARKET_JWT_REFRESH_TOKEN_SECRET) as { id: string }
}
