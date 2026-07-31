export const VendorType = {
    MARKET_VENDOR: "market_vendor",
    MANDI_VENDOR: "mandi_vendor",
} as const

export type VendorType = (typeof VendorType)[keyof typeof VendorType]

export function parseVendorType(type: string | null): VendorType | null {
    if (!type) return null
    if ((Object.values(VendorType) as string[]).includes(type)) {
        return type as VendorType
    }
    return null
}
