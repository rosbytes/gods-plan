/**
 * Short, memorable, collision-free unique ID generator.
 *
 * Design:
 *  - Uniqueness comes from a monotonic sequence (DB sequence or allocated block),
 *    NOT from randomness. This is what makes short IDs safe at national scale.
 *  - Encoded with Crockford's Base32 alphabet (excludes I, L, O, U to avoid
 *    visual/typo confusion).
 *  - A trailing check character (sequence mod 37) catches single-character
 *    typos and most adjacent-swap errors, same role as PAN's final letter.
 *
 * Capacity:
 *  - 7 base32 chars  -> 32^7  ≈ 34.4 billion IDs
 *  - 8 base32 chars  -> 32^8  ≈ 1.1 trillion IDs
 *  Pick the length based on your projected volume; 7-8 chars comfortably
 *  covers India-scale population with room for decades of growth.
 */

// Crockford's Base32 alphabet — 32 symbols, no ambiguous characters
const ENCODE_SYMBOLS = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"

// 37-symbol alphabet used ONLY for the check character (32 + 5 extra reserved symbols)
const CHECK_SYMBOLS = ENCODE_SYMBOLS + "*~$=U"

/** Encode a non-negative integer as Crockford Base32 (no padding). */
export function encodeBase32(value: bigint): string {
    if (value < 0n) throw new Error("value must be non-negative")
    if (value === 0n) return "0"

    let n = value
    let out = ""
    while (n > 0n) {
        out = ENCODE_SYMBOLS[Number(n % 32n)] + out
        n /= 32n
    }
    return out
}

/** Decode a Crockford Base32 string back to its integer value. */
export function decodeBase32(input: string): bigint {
    let n = 0n
    for (const ch of input.toUpperCase()) {
        const idx = ENCODE_SYMBOLS.indexOf(ch)
        if (idx === -1) throw new Error(`Invalid Base32 character: ${ch}`)
        n = n * 32n + BigInt(idx)
    }
    return n
}

/** Compute the single check character for a given sequence value. */
function checkSymbol(value: bigint): string {
    return CHECK_SYMBOLS[Number(value % 37n)]!
}

export interface GenerateIdOptions {
    /** Optional short category/region prefix, e.g. "MH" or "B" (not part of the checksum). */
    prefix?: string
    /** Minimum length of the encoded sequence portion (zero-padded on the left). Default 7. */
    minLength?: number
}

/**
 * Generate a public ID from a guaranteed-unique sequence number.
 * `sequence` MUST come from a real unique source (DB sequence, allocated block, etc.)
 * — this function does not itself guarantee uniqueness, it only encodes it.
 */
export function generateId(sequence: bigint, options: GenerateIdOptions = {}): string {
    const { prefix = "", minLength = 7 } = options

    let encoded = encodeBase32(sequence)
    if (encoded.length < minLength) {
        encoded = encoded.padStart(minLength, "0")
    }

    return `${prefix}${encoded}${checkSymbol(sequence)}`
}

/** Validate an ID's structure and checksum. Does NOT confirm the ID was actually issued. */
export function verifyId(id: string, prefixLength = 0): boolean {
    if (id.length <= prefixLength + 1) return false

    const body = id.slice(prefixLength, -1)
    const check = id.slice(-1).toUpperCase()

    try {
        const value = decodeBase32(body)
        return checkSymbol(value) === check
    } catch {
        return false
    }
}

/** Decode an ID back to its underlying sequence number (e.g., for DB lookups). */
export function decodeId(id: string, prefixLength = 0): bigint {
    const body = id.slice(prefixLength, -1)
    return decodeBase32(body)
}

// --- Example usage ---
// const id = generateId(482913771n, { prefix: "B" }); // "B00CTQ3B" (example)
// verifyId(id, 1); // true
// decodeId(id, 1); // 482913771n

console.log(generateId(33n, { minLength: 7 }))
console.log(generateId(482913771n, { minLength: 7 }))
console.log(decodeBase32("0001111"))
// 1,108,378,657  || 1,111,111
// 34,636,833  || 0,111,111
// 1,082,401  || 0,011,111
// 33,825  || 0,001,111
