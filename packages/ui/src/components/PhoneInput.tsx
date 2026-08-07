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

    const [selectedCountry, setSelectedCountry] = useState<CountryCode>(defaultCountry)
    const [rawInputValue, setRawInputValue] = useState<string>(value)
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

    // Calculate phone metadata using libphonenumber-js
    const calculateMeta = (inputVal: string, country: CountryCode): PhoneInputMeta => {
        const currentCallingCode = getCountryCallingCode(country)
        const parsed = parsePhoneNumberFromString(inputVal, country)
        const isValid = parsed ? parsed.isValid() : false

        let e164 = ""
        let nationalNumber = ""
        let formattedNumber = inputVal

        if (parsed) {
            e164 = parsed.number
            nationalNumber = parsed.nationalNumber
            formattedNumber = parsed.formatInternational()
        } else {
            const digits = inputVal.replace(/\D/g, "")
            e164 = `+${currentCallingCode}${digits}`
            nationalNumber = digits
            formattedNumber = inputVal
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

        // Auto detect country if user typed/pasted a number starting with '+'
        if (input.startsWith("+")) {
            const parsed = parsePhoneNumberFromString(input)
            if (parsed && parsed.country) {
                const detectedCountry = parsed.country
                const formatted = new AsYouType(detectedCountry).input(input)
                setSelectedCountry(detectedCountry)
                setRawInputValue(formatted)
                const meta = calculateMeta(formatted, detectedCountry)
                onChange?.(formatted, meta)
                return
            }
        }

        // Format dynamically as typed for the current selected country
        const formatted = new AsYouType(selectedCountry).input(input)
        setRawInputValue(formatted)
        const meta = calculateMeta(formatted, selectedCountry)
        onChange?.(formatted, meta)
    }

    const handleSelectCountry = (country: CountryCode) => {
        setSelectedCountry(country)
        setIsDropdownOpen(false)
        setSearchQuery("")
        const meta = calculateMeta(rawInputValue, country)
        onChange?.(rawInputValue, meta)
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
