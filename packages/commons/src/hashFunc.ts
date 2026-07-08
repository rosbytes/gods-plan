import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12

export const hashTheMandiVendorPassword = (password: string) => {
    const hash = bcrypt.hashSync(password, SALT_ROUNDS)
    return hash
}

export const compareMandiVendorPassword = (plainPassword: string, hashPassword: string) => {
    const res = bcrypt.compareSync(plainPassword, hashPassword)
    return res
}

export const hashAdminPassword = (password: string) => {
    const hash = bcrypt.hashSync(password, SALT_ROUNDS)
    return hash
}

export const compareAdminPassword = (plainPassword: string, hashPassword: string) => {
    const res = bcrypt.compareSync(plainPassword, hashPassword)
    return res
}
