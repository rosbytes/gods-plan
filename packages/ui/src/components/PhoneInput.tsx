import React, { useState, useEffect, useRef, useMemo } from "react"
import { Icon } from "@iconify/react"
import {
    getCountries,
    getCountryCallingCode,
    parsePhoneNumberFromString,
    type CountryCode,
    AsYouType,
} from "libphonenumber-js"

export interface PhoneInputMeta {
    isValid: boolean
    country: CountryCode
    callingCode: string
    nationalNumber: string
    formattedNumber: string
    e164: string
}

export interface PhoneInputProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
> {
    value?: string
    onChange?: (value: string, meta: PhoneInputMeta) => void
    defaultCountry?: CountryCode
    preferredCountries?: CountryCode[]
    label?: string
    error?: string
    disabled?: boolean
    className?: string
}

interface CountryOption {
    code: CountryCode
    name: string
    callingCode: string
}

// Dynamically resolve country names in English using standard browser Intl API
const displayNames =
    typeof Intl !== "undefined" && Intl.DisplayNames
        ? new Intl.DisplayNames(["en"], { type: "region" })
        : null

function getCountryName(countryCode: CountryCode): string {
    try {
        return displayNames?.of(countryCode) || countryCode
    } catch {
        return countryCode
    }
}

// Convert country code to emoji flag fallback
function getEmojiFlag(countryCode: string): string {
    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
}

const DEFAULT_PREFERRED: CountryCode[] = ["IN", "US", "GB", "AE", "CA", "SG", "AU"]

// Helper: Extract and format national phone number without country calling code
function parseAndFormatNational(
    val: string,
    defaultCountry: CountryCode,
): { detectedCountry: CountryCode; nationalFormatted: string } {
    if (!val) return { detectedCountry: defaultCountry, nationalFormatted: "" }

    const str = val.trim()

    // If starts with '+', it is an international format (full or partial like "+919")
    if (str.startsWith("+")) {
        const parsed = parsePhoneNumberFromString(str)
        if (parsed && parsed.country && parsed.nationalNumber) {
            const formatted = new AsYouType(parsed.country).input(parsed.nationalNumber)
            return { detectedCountry: parsed.country, nationalFormatted: formatted }
        }

        // For partial input like "+919" or "+91": strip '+' and match calling code
        const digits = str.slice(1).replace(/\D/g, "")
        let defaultCallingCode = ""
        try {
            defaultCallingCode = getCountryCallingCode(defaultCountry)
        } catch {}

        if (defaultCallingCode && digits.startsWith(defaultCallingCode)) {
            const nationalPart = digits.slice(defaultCallingCode.length)
            const formatted = new AsYouType(defaultCountry).input(nationalPart)
            return { detectedCountry: defaultCountry, nationalFormatted: formatted }
        }

        // Check preferred and other countries
        for (const c of DEFAULT_PREFERRED) {
            try {
                const code = getCountryCallingCode(c)
                if (digits.startsWith(code)) {
                    const nationalPart = digits.slice(code.length)
                    const formatted = new AsYouType(c).input(nationalPart)
                    return { detectedCountry: c, nationalFormatted: formatted }
                }
            } catch {}
        }

        const formatted = new AsYouType(defaultCountry).input(digits)
        return { detectedCountry: defaultCountry, nationalFormatted: formatted }
    }

    // If national format (e.g. "9876543210" or "9")
    const parsed = parsePhoneNumberFromString(str, defaultCountry)
    if (parsed && parsed.nationalNumber) {
        const formatted = new AsYouType(defaultCountry).input(parsed.nationalNumber)
        return { detectedCountry: defaultCountry, nationalFormatted: formatted }
    }

    // Strip leading default country calling code if user typed e.g. "919876543210"
    const digits = str.replace(/\D/g, "")
    let defaultCallingCode = ""
    try {
        defaultCallingCode = getCountryCallingCode(defaultCountry)
    } catch {}

    const nationalDigits =
        defaultCallingCode &&
        digits.startsWith(defaultCallingCode) &&
        digits.length > defaultCallingCode.length + 4
            ? digits.slice(defaultCallingCode.length)
            : digits

    const formatted = new AsYouType(defaultCountry).input(nationalDigits)
    return { detectedCountry: defaultCountry, nationalFormatted: formatted }
}

export function PhoneInput({
    value = "",
    onChange,
    defaultCountry = "IN",
    preferredCountries = DEFAULT_PREFERRED,
    label,
    error: customError,
    disabled = false,
    className = "",
    placeholder = "Enter phone number",
    id,
    ...props
}: PhoneInputProps) {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : "phone-input")
    const dropdownRef = useRef<HTMLDivElement>(null)

    const initial = useMemo(() => parseAndFormatNational(value, defaultCountry), [])
    const [selectedCountry, setSelectedCountry] = useState<CountryCode>(initial.detectedCountry)
    const [rawInputValue, setRawInputValue] = useState<string>(initial.nationalFormatted)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // Build country list
    const countryList = useMemo<CountryOption[]>(() => {
        const all = getCountries()
        const options: CountryOption[] = all.map((code) => {
            let callingCode = ""
            try {
                callingCode = getCountryCallingCode(code)
            } catch (e) {
                callingCode = ""
            }
            return {
                code,
                name: getCountryName(code),
                callingCode,
            }
        })

        // Sort: preferred first, then alphabetically by name
        const preferredSet = new Set(preferredCountries)
        return options.sort((a, b) => {
            const aPref = preferredSet.has(a.code)
            const bPref = preferredSet.has(b.code)
            if (aPref && !bPref) return -1
            if (!aPref && bPref) return 1
            return a.name.localeCompare(b.name)
        })
    }, [preferredCountries])

    const filteredCountries = useMemo(() => {
        if (!searchQuery.trim()) return countryList
        const q = searchQuery.toLowerCase().trim()
        return countryList.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.code.toLowerCase().includes(q) ||
                c.callingCode.includes(q),
        )
    }, [countryList, searchQuery])

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Sync controlled value prop
    useEffect(() => {
        if (value !== undefined) {
            const { detectedCountry, nationalFormatted } = parseAndFormatNational(
                value,
                selectedCountry,
            )
            const currentDigits = rawInputValue.replace(/\D/g, "")
            const nextDigits = nationalFormatted.replace(/\D/g, "")

            if (
                nextDigits !== currentDigits ||
                (detectedCountry !== selectedCountry && value.startsWith("+"))
            ) {
                if (detectedCountry !== selectedCountry) {
                    setSelectedCountry(detectedCountry)
                }
                setRawInputValue(nationalFormatted)
            }
        }
    }, [value])

    // Calculate phone metadata using libphonenumber-js
    const calculateMeta = (nationalInput: string, country: CountryCode): PhoneInputMeta => {
        let currentCallingCode = ""
        try {
            currentCallingCode = getCountryCallingCode(country)
        } catch {
            currentCallingCode = ""
        }

        const cleanDigits = nationalInput.replace(/\D/g, "")
        const parsed = parsePhoneNumberFromString(cleanDigits, country)
        const isValid = parsed ? parsed.isValid() : false

        let e164 = ""
        let nationalNumber = ""
        let formattedNumber = nationalInput

        if (parsed) {
            e164 = parsed.number
            nationalNumber = parsed.nationalNumber
            formattedNumber = parsed.formatNational()
        } else {
            e164 = cleanDigits ? `+${currentCallingCode}${cleanDigits}` : ""
            nationalNumber = cleanDigits
            formattedNumber = nationalInput
        }

        return {
            isValid,
            country,
            callingCode: currentCallingCode,
            nationalNumber,
            formattedNumber,
            e164,
        }
    }

    // Handle user input changes + auto country detection
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value

        // Auto detect country if user pasted a number starting with '+'
        if (input.startsWith("+")) {
            const { detectedCountry, nationalFormatted } = parseAndFormatNational(
                input,
                selectedCountry,
            )
            setSelectedCountry(detectedCountry)
            setRawInputValue(nationalFormatted)
            const meta = calculateMeta(nationalFormatted, detectedCountry)
            onChange?.(nationalFormatted, meta)
            return
        }

        // Clean user input and format as national number
        const digits = input.replace(/[^\d\s-]/g, "")
        const formatted = new AsYouType(selectedCountry).input(digits)
        setRawInputValue(formatted)
        const meta = calculateMeta(formatted, selectedCountry)
        onChange?.(formatted, meta)
    }

    const handleSelectCountry = (country: CountryCode) => {
        setSelectedCountry(country)
        setIsDropdownOpen(false)
        setSearchQuery("")
        const digits = rawInputValue.replace(/\D/g, "")
        const formatted = new AsYouType(country).input(digits)
        setRawInputValue(formatted)
        const meta = calculateMeta(formatted, country)
        onChange?.(formatted, meta)
    }

    const currentCallingCode = useMemo(() => {
        try {
            return getCountryCallingCode(selectedCountry)
        } catch {
            return ""
        }
    }, [selectedCountry])

    const meta = useMemo(
        () => calculateMeta(rawInputValue, selectedCountry),
        [rawInputValue, selectedCountry],
    )

    const displayError =
        customError || (rawInputValue.trim() && !meta.isValid ? "Invalid phone number" : "")

    return (
        <div className="flex w-full flex-col gap-1.5">
            {label && (
                <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
                    {label}
                </label>
            )}

            <div className="relative flex w-full items-center" ref={dropdownRef}>
                {/* Country Code & Flag Selector Button */}
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className={`flex items-center gap-1.5 rounded-l-xl border border-r-0 bg-gray-50 px-3 py-3 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100 focus:outline-none ${
                        displayError ? "border-red-500" : "border-gray-200"
                    } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    aria-label="Select Country Code"
                >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full">
                        <Icon
                            icon={`circle-flags:${selectedCountry.toLowerCase()}`}
                            className="h-5 w-5 object-cover"
                            fallback={<span>{getEmojiFlag(selectedCountry)}</span>}
                        />
                    </span>
                    <span className="font-semibold text-gray-700">+{currentCallingCode}</span>
                    <Icon icon="lucide:chevron-down" className="h-4 w-4 shrink-0 text-gray-400" />
                </button>

                {/* Country Selection Dropdown */}
                {isDropdownOpen && (
                    <div className="absolute top-full left-0 z-50 mt-1.5 flex max-h-80 w-72 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                        {/* Search Filter */}
                        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/50 p-2">
                            <Icon
                                icon="lucide:search"
                                className="ml-1 h-4 w-4 shrink-0 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search country or code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent py-1 text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
                                autoFocus
                            />
                        </div>

                        {/* Country List */}
                        <div className="max-h-64 divide-y divide-gray-50 overflow-y-auto">
                            {filteredCountries.length === 0 ? (
                                <div className="p-4 text-center text-xs text-gray-500">
                                    No country found
                                </div>
                            ) : (
                                filteredCountries.map((c) => {
                                    const isSelected = c.code === selectedCountry
                                    return (
                                        <button
                                            key={c.code}
                                            type="button"
                                            onClick={() => handleSelectCountry(c.code)}
                                            className={`flex w-full items-center justify-between px-3 py-2 text-xs font-medium transition-colors hover:bg-teal-50/60 ${
                                                isSelected
                                                    ? "bg-teal-50/90 text-[#0B4E3E]"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full">
                                                    <Icon
                                                        icon={`circle-flags:${c.code.toLowerCase()}`}
                                                        className="h-4 w-4 object-cover"
                                                        fallback={
                                                            <span>{getEmojiFlag(c.code)}</span>
                                                        }
                                                    />
                                                </span>
                                                <span className="truncate">{c.name}</span>
                                            </div>
                                            <div className="ml-2 flex shrink-0 items-center gap-1.5">
                                                <span className="font-mono text-gray-400">
                                                    +{c.callingCode}
                                                </span>
                                                {isSelected && (
                                                    <Icon
                                                        icon="lucide:check"
                                                        className="h-3.5 w-3.5 text-[#0B4E3E]"
                                                    />
                                                )}
                                            </div>
                                        </button>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* Phone Number Input Field */}
                <input
                    id={inputId}
                    type="tel"
                    disabled={disabled}
                    placeholder={placeholder}
                    value={rawInputValue}
                    onChange={handleInputChange}
                    className={`w-full rounded-r-xl border bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none ${
                        displayError
                            ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                            : "border-gray-200 focus:border-[#0B4E3E] focus:ring-1 focus:ring-[#0B4E3E]"
                    } ${className}`}
                    {...props}
                />
            </div>

            {/* Error Message Display */}
            {displayError && (
                <span className="mt-0.5 text-xs font-medium text-red-500">{displayError}</span>
            )}
        </div>
    )
}
