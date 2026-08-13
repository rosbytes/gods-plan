import React, { useState, useEffect } from "react"
import Button from "./ui/Button"

interface UpdatePriceDialogProps {
    isOpen: boolean
    onClose: () => void
    currentPrice: number
    onUpdate: (price: number) => Promise<void>
    isLoading: boolean
}

export default function UpdatePriceDialog({
    isOpen,
    onClose,
    currentPrice,
    onUpdate,
    isLoading,
}: UpdatePriceDialogProps) {
    const [priceInput, setPriceInput] = useState<string>("")

    useEffect(() => {
        if (isOpen) {
            setPriceInput(currentPrice > 0 ? currentPrice.toString() : "")
        }
    }, [isOpen, currentPrice])

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const parsed = parseFloat(priceInput)
        if (isNaN(parsed) || parsed <= 0) {
            return
        }
        onUpdate(parsed)
    }

    const isValid = parseFloat(priceInput) > 0

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px] transition-opacity duration-200">
            {/* Backdrop Click Closes the Modal */}
            <div className="absolute inset-0 cursor-default" onClick={onClose} />

            {/* Modal Box */}
            <div className="relative z-10 w-full max-w-85.5 overflow-hidden rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-apercu text-[18px] font-bold text-[#111111]">
                            Today’s Price
                        </h3>
                        <span className="font-apercu text-[13px] font-semibold text-[#0B4E3E]">
                            By 06:00 PM
                        </span>
                    </div>

                    {/* Styled Input Container */}
                    <div className="mb-5 flex h-13 items-center justify-between rounded-xl bg-[#F2F3F5] px-4">
                        <span className="font-apercu text-[18px] font-bold text-[#111111]">₹</span>
                        <input
                            type="number"
                            step="0.01"
                            value={priceInput}
                            onChange={(e) => setPriceInput(e.target.value)}
                            disabled={isLoading}
                            className="font-apercu mx-2 w-full bg-transparent text-center text-[20px] font-bold text-[#111111] focus:outline-none"
                            placeholder="0"
                            autoFocus
                        />
                        <span className="font-apercu text-[14px] font-semibold whitespace-nowrap text-[#7A7C85]">
                            / kg
                        </span>
                    </div>

                    {/* Action Button */}
                    <Button type="submit" isLoading={isLoading} disabled={!isValid || isLoading}>
                        Update
                    </Button>
                </form>
            </div>
        </div>
    )
}
