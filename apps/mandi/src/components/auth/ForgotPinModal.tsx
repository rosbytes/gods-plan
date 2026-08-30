import React, { useState, useEffect, useRef } from "react"
import { PhoneInput } from "@ros/ui"
import { toast } from "sonner"
import { trpc } from "@/libs/trpc"
import { useMsg91OtpScript } from "@/hooks/useMsg91OtpScript"

declare global {
    interface Window {
        initSendOTP?: (config: any) => void
        sendOtp?: (phone: string, success: (data: any) => void, failure: (err: any) => void) => void
        verifyOtp?: (
            otp: string,
            success: (data: any) => void,
            failure: (err: any) => void,
            reqId?: string,
        ) => void
    }
}

interface ForgotPinModalProps {
    isOpen: boolean
    onClose: () => void
    initialPhone?: string
    onSuccess: (phone: string) => void
}

export function ForgotPinModal({
    isOpen,
    onClose,
    initialPhone = "",
    onSuccess,
}: ForgotPinModalProps) {
    const [step, setStep] = useState<"phone" | "otp">("phone")
    const [phone, setPhone] = useState(initialPhone)
    const [otp, setOtp] = useState(["", "", "", ""])
    const [reqId, setReqId] = useState("")
    const [newPin, setNewPin] = useState("")
    const [confirmPin, setConfirmPin] = useState("")
    const [error, setError] = useState("")
    const [sending, setSending] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [resendTimer, setResendTimer] = useState(0)

    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Update phone when modal opens
    useEffect(() => {
        if (isOpen) {
            setPhone(initialPhone)
            setStep("phone")
            setOtp(["", "", "", ""])
            setNewPin("")
            setConfirmPin("")
            setError("")
            setResendTimer(0)
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => {
            document.body.style.overflow = "unset"
        }
    }, [isOpen, initialPhone])

    // Resend countdown timer
    useEffect(() => {
        if (resendTimer <= 0) return
        const timer = setInterval(() => {
            setResendTimer((prev) => prev - 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [resendTimer])

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose()
            }
        }
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown)
        }
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, onClose])

    // Reset PIN tRPC mutation
    const resetPinMutation = trpc.auth.resetPin.useMutation({
        onSuccess: (data) => {
            toast.success(data.message || "Password reset successfully! You can now log in.")
            onSuccess(phone)
            onClose()
        },
        onError: (err) => {
            setError(err.message || "Failed to reset password")
            toast.error(err.message || "Failed to reset password")
        },
        onSettled: () => setVerifying(false),
    })

    // Load MSG91 script
    useMsg91OtpScript()

    const getMsg91Digits = (raw: string) => {
        return raw.replace(/\D/g, "")
    }

    // Initialize MSG91 SDK Widget
    const prepareMsg91 = (targetPhone: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const digits = getMsg91Digits(targetPhone)
            if (!digits) {
                return reject(new Error("Valid phone number is required"))
            }

            const widgetId = (import.meta as any).env.VITE_MSG91_WIDGET_ID || ""
            const tokenAuth = (import.meta as any).env.VITE_MSG91_TOKEN_AUTH || ""

            const configuration = {
                widgetId,
                tokenAuth,
                identifier: digits,
                exposeMethods: true,
                captchaRenderId: "",
                success: (data: any) => {
                    console.log("MSG91 Widget callback success:", data)
                },
                failure: (err: any) => {
                    console.error("MSG91 Widget callback error:", err)
                },
            }

            ;(window as any).configuration = configuration

            const start = Date.now()
            const interval = setInterval(() => {
                if (window.initSendOTP && !window.sendOtp) {
                    window.initSendOTP(configuration)
                }

                if (typeof window.sendOtp === "function") {
                    clearInterval(interval)
                    resolve()
                } else if (Date.now() - start > 6000) {
                    clearInterval(interval)
                    if (typeof window.sendOtp === "function") {
                        resolve()
                    } else {
                        reject(
                            new Error(
                                "OTP service timed out. Please check your network connection or ad-blocker.",
                            ),
                        )
                    }
                }
            }, 50)
        })
    }

    // Step 1: Send OTP
    const handleSendOtp = async () => {
        const digits = getMsg91Digits(phone)
        if (digits.length < 10) {
            setError("Please enter a valid phone number")
            return
        }

        setError("")
        setSending(true)

        try {
            await prepareMsg91(phone)
            window.sendOtp!(
                digits,
                (data: any) => {
                    const id = data?.reqId || data?.message || data?.data?.reqId || ""
                    if (id) setReqId(id)
                    setSending(false)
                    setStep("otp")
                    setResendTimer(30)
                    toast.success("OTP sent to your mobile number")
                },
                (err: any) => {
                    setSending(false)
                    setError(err?.message || "Failed to send OTP. Please check the number.")
                    toast.error(err?.message || "Failed to send OTP")
                },
            )
        } catch (err: any) {
            setSending(false)
            setError(err?.message || "Could not initialize OTP service. Please retry.")
            toast.error(err?.message || "OTP service unavailable")
        }
    }

    // Resend OTP
    const handleResendOtp = async () => {
        if (resendTimer > 0 || sending) return
        const digits = getMsg91Digits(phone)
        if (!digits) return

        setSending(true)
        setError("")

        try {
            await prepareMsg91(phone)
            window.sendOtp!(
                digits,
                (data: any) => {
                    const id = data?.reqId || data?.message || data?.data?.reqId || ""
                    if (id) setReqId(id)
                    setSending(false)
                    setResendTimer(30)
                    toast.success("OTP resent successfully")
                },
                (err: any) => {
                    setSending(false)
                    setError(err?.message || "Failed to resend OTP")
                    toast.error(err?.message || "Failed to resend OTP")
                },
            )
        } catch (err: any) {
            setSending(false)
            setError(err?.message || "Failed to resend OTP")
            toast.error(err?.message || "Failed to resend OTP")
        }
    }

    // 4-digit OTP box inputs
    const handleOtpChange = (index: number, val: string) => {
        if (!/^[0-9]?$/.test(val)) return
        const updated = [...otp]
        updated[index] = val
        setOtp(updated)

        if (val && index < 3) {
            otpInputRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus()
        }
    }

    // Step 2: Verify OTP and Reset PIN
    const handleVerifyAndReset = async () => {
        const code = otp.join("")
        if (code.length < 4) {
            setError("Please enter the complete 4-digit OTP")
            return
        }
        if (!/^\d{4}$/.test(newPin)) {
            setError("New Password must be exactly 4 digits")
            return
        }
        if (newPin !== confirmPin) {
            setError("New Password and Confirm Password do not match")
            return
        }

        setError("")
        setVerifying(true)

        try {
            await prepareMsg91(phone)
            window.verifyOtp!(
                code,
                (data: any) => {
                    const token =
                        data?.message ||
                        data?.token ||
                        data?.["access-token"] ||
                        (typeof data === "string" ? data : "")

                    if (token) {
                        resetPinMutation.mutate({
                            phone,
                            accessToken: token,
                            newPin,
                        })
                    } else {
                        setVerifying(false)
                        setError("Could not obtain verification token. Please retry.")
                    }
                },
                (err: any) => {
                    setVerifying(false)
                    setError(err?.message || "Incorrect OTP code entered")
                    toast.error(err?.message || "Incorrect OTP")
                },
                reqId || undefined,
            )
        } catch (err: any) {
            setVerifying(false)
            setError(err?.message || "OTP provider is not ready. Please try again.")
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="font-apercu relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl transition-all duration-200 sm:rounded-2xl">
                {/* Modal Header */}
                <div className="mb-4 flex items-start justify-between border-b border-gray-100 pb-3">
                    <div>
                        <h3 className="text-xl font-bold text-[#111111]">
                            {step === "phone"
                                ? "Forgot Mandi Password"
                                : "Verify OTP & Set Password"}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                            {step === "phone"
                                ? "Enter your registered mobile number to receive an OTP"
                                : `Enter the OTP sent to ${phone} and set your new 4-digit password`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                {/* Body Content */}
                <div className="space-y-4 pt-1">
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                            {error}
                        </div>
                    )}

                    {step === "phone" ? (
                        <div className="space-y-4">
                            <div>
                                <PhoneInput
                                    label="Registered Mobile Number *"
                                    value={phone}
                                    onChange={(val, meta) => {
                                        setPhone(meta.e164 || val)
                                        setError("")
                                    }}
                                    defaultCountry="IN"
                                    placeholder="Enter mobile number"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    disabled={sending || getMsg91Digits(phone).length < 10}
                                    onClick={handleSendOtp}
                                    className="flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#0B4E3E] text-base font-bold text-white shadow-sm transition-all hover:bg-[#093F32] active:scale-[0.985] disabled:cursor-not-allowed disabled:bg-[#D9E5E2] disabled:text-[#4A7A6E]"
                                >
                                    {sending ? "Sending OTP..." : "Send Verification OTP →"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Phone change row */}
                            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 text-xs text-gray-600">
                                <span className="font-semibold text-gray-800">{phone}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep("phone")
                                        setOtp(["", "", "", ""])
                                        setError("")
                                    }}
                                    className="cursor-pointer font-bold text-[#0B4E3E] hover:underline"
                                >
                                    Change Phone
                                </button>
                            </div>

                            {/* 4-digit OTP Inputs */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                                    4-Digit OTP Code *
                                </label>
                                <div className="flex justify-between gap-2.5">
                                    {[0, 1, 2, 3].map((idx) => (
                                        <input
                                            key={idx}
                                            ref={(el) => {
                                                otpInputRefs.current[idx] = el
                                            }}
                                            type="tel"
                                            maxLength={1}
                                            value={otp[idx]}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                            className="h-12 w-12 rounded-xl border border-gray-200 text-center text-lg font-bold text-gray-900 shadow-xs focus:border-[#0B4E3E] focus:ring-1 focus:ring-[#0B4E3E] focus:outline-none"
                                        />
                                    ))}
                                </div>

                                {/* Resend Timer / Button */}
                                <div className="mt-2 flex justify-end">
                                    {resendTimer > 0 ? (
                                        <span className="text-xs font-medium text-gray-400">
                                            Resend OTP in {resendTimer}s
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={sending}
                                            onClick={handleResendOtp}
                                            className="cursor-pointer text-xs font-bold text-[#0B4E3E] hover:underline disabled:opacity-50"
                                        >
                                            {sending ? "Resending..." : "Resend OTP"}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* New Password & Confirm Password */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                                        New 4-Digit Password *
                                    </label>
                                    <input
                                        type="password"
                                        maxLength={4}
                                        placeholder="e.g. 1234"
                                        value={newPin}
                                        onChange={(e) => {
                                            setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                                            setError("")
                                        }}
                                        className="h-12 w-full rounded-xl border border-gray-200 px-3 text-sm font-semibold text-gray-900 focus:border-[#0B4E3E] focus:ring-1 focus:ring-[#0B4E3E] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                                        Confirm Password *
                                    </label>
                                    <input
                                        type="password"
                                        maxLength={4}
                                        placeholder="Re-enter password"
                                        value={confirmPin}
                                        onChange={(e) => {
                                            setConfirmPin(
                                                e.target.value.replace(/\D/g, "").slice(0, 4),
                                            )
                                            setError("")
                                        }}
                                        className="h-12 w-full rounded-xl border border-gray-200 px-3 text-sm font-semibold text-gray-900 focus:border-[#0B4E3E] focus:ring-1 focus:ring-[#0B4E3E] focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    disabled={
                                        verifying ||
                                        resetPinMutation.isPending ||
                                        otp.join("").length < 4 ||
                                        newPin.length !== 4 ||
                                        confirmPin.length !== 4 ||
                                        newPin !== confirmPin
                                    }
                                    onClick={handleVerifyAndReset}
                                    className="flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#0B4E3E] text-base font-bold text-white shadow-sm transition-all hover:bg-[#093F32] active:scale-[0.985] disabled:cursor-not-allowed disabled:bg-[#D9E5E2] disabled:text-[#4A7A6E]"
                                >
                                    {verifying || resetPinMutation.isPending
                                        ? "Verifying & Updating..."
                                        : "Verify & Reset Password"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
