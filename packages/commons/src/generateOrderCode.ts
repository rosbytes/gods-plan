import { randomBytes } from "node:crypto"

const CROCKFORD_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"

function crockfordBase32Encode(buffer: Buffer): string {
    let bits = 0
    let value = 0
    let output = ""

    for (const byte of buffer) {
        value = (value << 8) | byte
        bits += 8

        while (bits >= 5) {
            output += CROCKFORD_ALPHABET[(value >>> (bits - 5)) & 31]
            bits -= 5
        }
    }

    if (bits > 0) {
        output += CROCKFORD_ALPHABET[(value << (5 - bits)) & 31]
    }

    return output
}

function computeChecksum(encoded: string): string {
    // simple mod-32 checksum over character codes — swap for whatever
    // checksum scheme you're already using in your national ID system
    let sum = 0
    for (const char of encoded) {
        sum += CROCKFORD_ALPHABET.indexOf(char)
    }
    return CROCKFORD_ALPHABET[sum % 32]!
}

export function generateOrderCode(): string {
    const randomPart = crockfordBase32Encode(randomBytes(5)) // 40 bits → 8 chars
    const checksum = computeChecksum(randomPart)
    return `ORD-${randomPart}${checksum}`
}
