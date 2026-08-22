import React, { useState, useEffect, useRef } from "react"
import { PhoneInput } from "@ros/ui"
import { toast } from "sonner"
import { trpc } from "../../lib/trpc"
import { env } from "../../configs/env.config"
import { Modal } from "../ui/Modal"
import { Button, Input } from "../ui"
import { SpinnerIcon } from "../common/Icons"
import { useMsg91OtpScript } from "../../hooks/useMsg91OtpScript"

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

    // Update phone when initialPhone changes
    useEffect(() => {
        if (isOpen) {
            setPhone(initialPhone)
            setStep("phone")
            setOtp(["", "", "", ""])
            setNewPin("")
            setConfirmPin("")
            setError("")
            setResendTimer(0)
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

    // Reset PIN tRPC mutation
    const resetPinMutation = trpc.auth.resetPin.useMutation({
        onSuccess: (data) => {
            toast.success(data.message || "PIN reset successfully! You can now log in.")
            onSuccess(phone)
            onClose()
        },
        onError: (err) => {
            setError(err.message || "Failed to reset PIN")
            toast.error(err.message || "Failed to reset PIN")
        },
        onSettled: () => setVerifying(false),
    })

    // Load MSG91 script using dedicated hook
    const isScriptLoaded = useMsg91OtpScript()

    const getMsg91Digits = (raw: string) => {
        return raw.replace(/\D/g, "")
    }

    // Initialize MSG91 SDK Widget & ensure sendOtp is ready
    const prepareMsg91 = (targetPhone: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const digits = getMsg91Digits(targetPhone)
            if (!digits) {
                return reject(new Error("Valid phone number is required"))
            }

            const configuration = {
                widgetId: env.VITE_MSG91_WIDGET_ID,
                tokenAuth: env.VITE_MSG91_TOKEN_AUTH,
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
                    console.log("sendOtp success:", data)
                    const id = data?.reqId || data?.message || data?.data?.reqId || ""
                    if (id) setReqId(id)
                    setSending(false)
                    setStep("otp")
                    setResendTimer(30)
                    toast.success("OTP sent to your mobile number")
                },
                (err: any) => {
                    console.error("sendOtp error:", err)
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

    // Handle 4-digit OTP box inputs
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
            setError("New PIN must be exactly 4 digits")
            return
        }
        if (newPin !== confirmPin) {
            setError("New PIN and Confirm PIN do not match")
            return
        }

        setError("")
        setVerifying(true)

        try {
            await prepareMsg91(phone)
            window.verifyOtp!(
                code,
                (data: any) => {
                    console.log("verifyOtp success:", data)
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
                    console.error("verifyOtp failure:", err)
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={step === "phone" ? "Forgot Admin PIN" : "Verify OTP & Set PIN"}
            subtitle={
                step === "phone"
                    ? "Enter your registered phone number to receive a verification OTP"
                    : `Enter the OTP sent to ${phone} and set your new 4-digit PIN`
            }
            maxWidth="sm"
        >
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
                                label="Registered Phone Number *"
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
                            <Button
                                variant="primary"
                                fullWidth
                                isLoading={sending}
                                disabled={getMsg91Digits(phone).length < 10}
                                onClick={handleSendOtp}
                            >
                                Send Verification OTP →
                            </Button>
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
                                className="cursor-pointer font-bold text-[#135B47] hover:underline"
                            >
                                Change Phone
                            </button>
                        </div>

                        {/* OTP Input Fields */}
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
                                        className="h-12 w-12 rounded-xl border border-gray-200 text-center text-lg font-bold text-gray-900 shadow-xs focus:border-[#135B47] focus:ring-1 focus:ring-[#135B47] focus:outline-none"
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
                                        className="cursor-pointer text-xs font-bold text-[#135B47] hover:underline disabled:opacity-50"
                                    >
                                        {sending ? "Resending..." : "Resend OTP"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* New PIN inputs */}
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="New 4-Digit PIN *"
                                type="password"
                                maxLength={4}
                                placeholder="e.g. 1234"
                                value={newPin}
                                onChange={(e) => {
                                    setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                                    setError("")
                                }}
                            />
                            <Input
                                label="Confirm PIN *"
                                type="password"
                                maxLength={4}
                                placeholder="Re-enter PIN"
                                value={confirmPin}
                                onChange={(e) => {
                                    setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                                    setError("")
                                }}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <Button
                                variant="primary"
                                fullWidth
                                isLoading={verifying || resetPinMutation.isPending}
                                disabled={
                                    otp.join("").length < 4 ||
                                    newPin.length !== 4 ||
                                    confirmPin.length !== 4 ||
                                    newPin !== confirmPin
                                }
                                onClick={handleVerifyAndReset}
                            >
                                Verify & Reset PIN
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}
