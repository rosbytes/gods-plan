import { describe, it, expect } from "vitest"
import {
    generateOrderCode,
    hashAdminPassword,
    compareAdminPassword,
    hashMarketVendorPassword,
    compareMarketVendorPassword,
    hashTheMandiVendorPassword,
    compareMandiVendorPassword,
} from "../index"

describe("@ros/commons - Order Code Generator", () => {
    it("generates an order code matching the prefix and format ORD-XXXXXXXXX", () => {
        const code = generateOrderCode()
        expect(code).toMatch(/^ORD-[0-9A-HJKMNP-Z]{9}$/)
    })

    it("generates unique codes across sequential invocations", () => {
        const codes = new Set(Array.from({ length: 100 }, () => generateOrderCode()))
        expect(codes.size).toBe(100)
    })
})

describe("@ros/commons - Password Hashing & Verification", () => {
    it("hashes and compares Admin passwords correctly", () => {
        const password = "AdminSecurePass123!"
        const hash = hashAdminPassword(password)
        expect(hash).not.toBe(password)
        expect(compareAdminPassword(password, hash)).toBe(true)
        expect(compareAdminPassword("WrongPassword", hash)).toBe(false)
    })

    it("hashes and compares Market Vendor passwords correctly", () => {
        const password = "VendorPinCode9876"
        const hash = hashMarketVendorPassword(password)
        expect(compareMarketVendorPassword(password, hash)).toBe(true)
        expect(compareMarketVendorPassword("WrongPin", hash)).toBe(false)
    })

    it("hashes and compares Mandi Vendor passwords correctly", () => {
        const password = "MandiSecretPass456"
        const hash = hashTheMandiVendorPassword(password)
        expect(compareMandiVendorPassword(password, hash)).toBe(true)
        expect(compareMandiVendorPassword("WrongPass", hash)).toBe(false)
    })
})
