import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { jsPDF } from "jspdf"
import { parseVendorType } from "../constants/vendor"
import { toast } from "sonner"

declare global {
    interface Window {
        initSendOTP?: (config: any) => void
        sendOtp?: (
            identifier: string,
            successCb?: (data: any) => void,
            failureCb?: (err: any) => void,
            reqId?: string,
        ) => void
        verifyOtp?: (
            otp: string | number,
            successCb?: (data: any) => void,
            failureCb?: (err: any) => void,
            reqId?: string,
        ) => void
        retryOtp?: (
            channel?: string | null,
            successCb?: (data: any) => void,
            failureCb?: (err: any) => void,
            reqId?: string,
        ) => void
    }
}

const WIDGET_ID = import.meta.env.VITE_MSG91_WIDGET_ID || "3667446b6845303535383633"
const TOKEN_AUTH = import.meta.env.VITE_MSG91_TOKEN_AUTH || "555702TCIzAXWxQ6a6b3257P1"

export default function VendorAgreement() {
    const navigate = useNavigate()
    const { vendorId, storeId } = useParams<{ vendorId: string; storeId: string }>()
    const [searchParams] = useSearchParams()
    const vendorType = parseVendorType(searchParams.get("type"))
    const typeParam = vendorType ? `?type=${vendorType}` : ""

    const [otp, setOtp] = useState(["", "", "", ""])
    const [reqId, setReqId] = useState<string>("")
    const [otpSent, setOtpSent] = useState(false)
    const [sending, setSending] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [error, setError] = useState("")
    const [showFullAgreement, setShowFullAgreement] = useState(false)

    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const { data: marketVendorData, isLoading: isMarketLoading } = trpc.vendor.getMarket.useQuery(
        { vendorId: vendorId! },
        { enabled: !!vendorId && vendorType === "market_vendor" },
    )

    const { data: mandiVendorData, isLoading: isMandiLoading } = trpc.vendor.getMandi.useQuery(
        { vendorId: vendorId! },
        { enabled: !!vendorId && vendorType === "mandi_vendor" },
    )

    const vendorData = vendorType === "mandi_vendor" ? mandiVendorData : marketVendorData
    const isLoading = vendorType === "mandi_vendor" ? isMandiLoading : isMarketLoading

    // Normalize phone to MSG91 format: digits only with country code, no '+' (e.g. "919876543210")
    const formatPhoneForMsg91 = (phone: string) => {
        if (!phone) return ""
        const digits = phone.replace(/\D/g, "")
        if (digits.length === 10) return `91${digits}`
        return digits
    }

    // Display format with + prefix
    const formatPhoneForDisplay = (phone: string) => {
        if (!phone) return ""
        if (phone.startsWith("+")) return phone
        if (phone.length === 10) return `+91${phone}`
        return `+${phone}`
    }

    const rawPhone = vendorData?.vendor?.primaryPhone ?? ""
    const msg91Phone = formatPhoneForMsg91(rawPhone)
    const displayPhone = formatPhoneForDisplay(rawPhone)

    // ── tRPC OTP mutation (verify access token with MSG91 backend) ───────────
    const verifyAccessTokenMutation = trpc.otp.verifyAccessToken.useMutation({
        onSuccess: () => {
            toast.success("OTP verified successfully")
            generateAgreementPdf()
            navigate(`/registered/${vendorId}/${storeId}${typeParam}`)
        },
        onError: (err) => {
            setError(err.message || "Access token verification failed")
            toast.error("Access token verification failed")
        },
        onSettled: () => setVerifying(false),
    })

    const handleVerifyAccessToken = (accessToken: string) => {
        setVerifying(true)
        verifyAccessTokenMutation.mutate({ accessToken })
    }

    // Initialize MSG91 Web SDK Widget with exposeMethods: true
    useEffect(() => {
        if (!msg91Phone) return

        const configuration = {
            widgetId: WIDGET_ID,
            tokenAuth: TOKEN_AUTH,
            identifier: msg91Phone,
            exposeMethods: true,
            captchaRenderId: "",
            success: (data: any) => {
                console.log("MSG91 Widget success response:", data)
                const token =
                    data?.message ||
                    data?.token ||
                    data?.["access-token"] ||
                    (typeof data === "string" ? data : "")
                if (token) {
                    handleVerifyAccessToken(token)
                }
            },
            failure: (error: any) => {
                console.error("MSG91 Widget failure:", error)
                setError(error?.message || "MSG91 Widget error")
            },
        }

        // Set global configuration for MSG91 provider
        ;(window as any).configuration = configuration

        const scriptId = "msg91-otp-provider"
        let script = document.getElementById(scriptId) as HTMLScriptElement | null

        const triggerSend = () => {
            if (window.initSendOTP) {
                window.initSendOTP(configuration)
            }
            if (window.sendOtp) {
                setSending(true)
                try {
                    window.sendOtp(
                        msg91Phone,
                        (data: any) => {
                            console.log("sendOtp success:", data)
                            const id = data?.reqId || data?.message || data?.data?.reqId || ""
                            if (id) setReqId(id)
                            setOtpSent(true)
                            setSending(false)
                            toast.success("OTP sent successfully")
                        },
                        (err: any) => {
                            console.error("sendOtp error:", err)
                            setSending(false)
                            setError(err?.message || "Failed to send OTP")
                        },
                    )
                } catch (err: any) {
                    console.error("sendOtp sync exception:", err)
                    setSending(false)
                }
                setTimeout(() => setSending(false), 3000)
            }
        }

        if (!script) {
            script = document.createElement("script")
            script.id = scriptId
            script.type = "text/javascript"
            script.src = "https://verify.msg91.com/otp-provider.js"
            script.onload = () => {
                triggerSend()
            }
            document.body.appendChild(script)
        } else {
            triggerSend()
        }
    }, [msg91Phone])

    const handleResendOtp = () => {
        if (!msg91Phone || sending) return
        setSending(true)
        setError("")

        let resolved = false
        const finishResend = () => {
            if (!resolved) {
                resolved = true
                setSending(false)
            }
        }

        // Safety timeout so button NEVER hangs on 'Sending...'
        const safetyTimer = setTimeout(() => {
            if (!resolved) {
                finishResend()
                toast.info("OTP request sent")
            }
        }, 3000)

        const onSuccess = (data: any) => {
            clearTimeout(safetyTimer)
            console.log("Resend OTP success:", data)
            const id = data?.reqId || data?.message || data?.data?.reqId || ""
            if (id) setReqId(id)
            finishResend()
            toast.success("OTP resent successfully")
        }

        const onFailure = (err: any) => {
            clearTimeout(safetyTimer)
            console.error("Resend OTP error:", err)
            finishResend()
            setError(err?.message || "Failed to resend OTP")
            toast.error(err?.message || "Failed to resend OTP")
        }

        try {
            if (window.sendOtp) {
                window.sendOtp(msg91Phone, onSuccess, onFailure)
            } else if (window.retryOtp) {
                window.retryOtp("11", onSuccess, onFailure, reqId || undefined)
            } else {
                clearTimeout(safetyTimer)
                finishResend()
                toast.error("OTP Widget is not initialized yet")
            }
        } catch (err: any) {
            clearTimeout(safetyTimer)
            onFailure(err)
        }
    }

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // auto-focus next for 4-digit OTP
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const generateAgreementPdf = () => {
        const doc = new jsPDF()
        const date = new Date().toLocaleDateString("en-IN")
        const name = vendorData?.vendor?.fullName || "[Vendor Name]"
        const phone = displayPhone

        const margin = 15
        const pageW = doc.internal.pageSize.getWidth()
        let cursorY = 20

        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("NON-DISCLOSURE & PRE-COLLABORATION INTENT AGREEMENT", pageW / 2, cursorY, {
            align: "center",
        })

        cursorY += 15
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")

        const lines = [
            `This Agreement is entered into on ${date}, by and between:`,
            "",
            "Oneprovisiongrowth Pvt Ltd",
            "(Operating under the brand name Republic of Sabjiwala)",
            "PAN: AAECO7051N",
            "CIN: U46301RJ2025PTC102143",
            '(Hereinafter referred to as the "Company")',
            "",
            "AND",
            "",
            `${name}`,
            `Business Name: Store_${storeId?.substring(0, 8)}`,
            '(Hereinafter referred to as the "Vendor")',
            "",
            'Collectively referred to as the "Parties".',
            "",
            "1. Purpose",
            "The Company has shared its business model, operational plan, and collaboration structure with the Vendor.",
            "This Agreement is intended to:",
            "• Protect the confidentiality of the shared information",
            "• Record the Vendor's interest and intent to collaborate with the Company",
            "",
            "2. Confidentiality",
            "The Vendor agrees that all information shared by the Company, including business model, pricing, vendor structure, and operational strategy, shall be treated as strictly confidential and shall not be disclosed or used for any unauthorized purpose.",
            "",
            "3. Acknowledgment of Discussion",
            "The Vendor confirms that:",
            "• The Company has explained its business model and collaboration structure",
            "• The Vendor has understood the concept and opportunity",
            "",
            "4. Expression of Intent",
            "The Vendor expresses a clear willingness and interest to collaborate with the Company.",
            "The Vendor agrees that:",
            "• They are open to entering into a formal legal agreement with the Company",
            "• They will not engage in any competing or conflicting activity using the shared information during this interim period",
            "",
            "5. Interim Understanding",
            "Until a formal agreement is executed:",
            "• Both Parties agree to proceed in good faith",
            "• This document acts as a temporary understanding and commitment of intent, not a final commercial agreement",
            "",
            "8. Digital Acceptance",
            "This Agreement shall be considered valid upon Digital Confirmation / OTP Verification.",
            "Such acceptance shall be legally valid under applicable Indian laws, including the Information Technology Act, 2000.",
            "",
            "10. Acceptance",
            "Vendor",
            `Name: ${name}`,
            `Contact Number: ${phone}`,
            "Acceptance Statement:",
            '"I confirm that I have understood the discussion and agree to the above terms."',
            "",
            `Digital Confirmation: verified via OTP (${phone})`,
            `Date: ${date}`,
        ]

        doc.setFontSize(10)
        lines.forEach((line) => {
            if (cursorY > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage()
                cursorY = 20
            }
            const splitLines = doc.splitTextToSize(line, pageW - margin * 2)
            doc.text(splitLines, margin, cursorY)
            cursorY += splitLines.length * 5
        })

        doc.save(`Vendor_Agreement_${name.replace(/\s+/g, "_")}.pdf`)
    }

    const handleVerify = () => {
        const code = otp.join("")
        if (code.length !== 4 || verifying) return

        setVerifying(true)
        setError("")

        let resolved = false
        const finishVerify = () => {
            if (!resolved) {
                resolved = true
                setVerifying(false)
            }
        }

        const safetyTimer = setTimeout(() => {
            if (!resolved) {
                finishVerify()
            }
        }, 5000)

        const onSuccess = (data: any) => {
            clearTimeout(safetyTimer)
            console.log("verifyOtp success:", data)
            const token =
                data?.message ||
                data?.token ||
                data?.["access-token"] ||
                (typeof data === "string" ? data : "")
            if (token) {
                handleVerifyAccessToken(token)
            } else {
                finishVerify()
                generateAgreementPdf()
                navigate(`/registered/${vendorId}/${storeId}${typeParam}`)
            }
        }

        const onFailure = (err: any) => {
            clearTimeout(safetyTimer)
            console.error("verifyOtp error:", err)
            finishVerify()
            setError(err?.message || "Incorrect OTP or verification failed")
            toast.error(err?.message || "OTP verification failed")
        }

        try {
            if (window.verifyOtp) {
                window.verifyOtp(code, onSuccess, onFailure, reqId || undefined)
            } else {
                clearTimeout(safetyTimer)
                finishVerify()
                toast.error("OTP Widget is not initialized yet")
            }
        } catch (err: any) {
            clearTimeout(safetyTimer)
            onFailure(err)
        }
    }

    if (isLoading) return <div className="p-10 text-center">Loading vendor...</div>

    return (
        <div className="flex min-h-screen flex-col bg-[#F5F6F8] pb-32 font-sans text-gray-900">
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 pt-12 pb-4 md:px-8 md:pt-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-200"
                    >
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </button>
                    <h1 className="text-[18px] font-bold tracking-tight md:text-xl">
                        Vendor Agreement
                    </h1>
                </div>

                <div className="mt-2 flex flex-col gap-5 px-5 md:px-8">
                    {/* Agreement Preview Card */}
                    <div className="rounded-[20px] bg-white p-5 shadow-sm">
                        <h2 className="mb-3 text-[15px] font-semibold text-gray-800">
                            Vendor Service Agreement
                        </h2>
                        <div className="relative mb-4 h-35 overflow-hidden rounded-xl bg-[#F8F9FA] p-4 text-[13px] leading-relaxed text-gray-600">
                            <p>
                                This Vendor Service Agreement ("Agreement") is entered into between:
                            </p>
                            <br />
                            <p>Republic of Sabjiwala ("ROS"),</p>
                            <p>and</p>
                            <p>The Vendor whose details are provided during registration.</p>
                            <br />
                            <p>By completing registration and accepting this Agreement...</p>

                            <div className="pointer-events-none absolute bottom-0 left-0 h-12 w-full bg-linear-to-t from-[#F8F9FA] to-transparent"></div>
                        </div>

                        <button
                            onClick={() => setShowFullAgreement(true)}
                            className="w-full cursor-pointer rounded-[14px] bg-[#F2F4F7] py-3 text-[14px] font-semibold text-gray-700 transition-colors hover:bg-[#e4e7ec]"
                        >
                            Read Full Agreement
                        </button>
                    </div>

                    {/* OTP Section */}
                    <div className="rounded-[20px] bg-white p-6 shadow-sm">
                        <h2 className="mb-1 text-[20px] font-bold text-gray-900">Enter OTP</h2>
                        <div className="mb-6 flex items-center gap-2">
                            <p className="text-[14px] text-gray-500">
                                OTP sent to{" "}
                                <span className="font-medium text-gray-700">
                                    {displayPhone || "Loading..."}
                                </span>
                            </p>
                            <button className="p-1">
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#666"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 20h9"></path>
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                </svg>
                            </button>
                        </div>

                        <div className="justify-[#135B47] mb-4 flex gap-3 sm:justify-start">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => {
                                        inputRefs.current[i] = el
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    className="h-14 w-12 rounded-xl border-2 border-gray-200 text-center text-xl font-bold text-gray-900 transition-colors focus:border-[#135B47] focus:outline-none sm:w-14"
                                />
                            ))}
                        </div>

                        {error && <p className="mb-2 text-center text-sm text-red-500">{error}</p>}

                        <div className="flex justify-end pr-2">
                            <button
                                disabled={sending}
                                onClick={handleResendOtp}
                                className="cursor-pointer text-[14px] font-semibold text-[#135B47] hover:underline disabled:opacity-50"
                            >
                                {sending ? "Sending..." : "Resend OTP"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Sticky Button */}
            <div className="fixed bottom-0 left-0 w-full bg-linear-to-t from-[#F5F6F8] via-[#F5F6F8] to-transparent px-5 py-6 md:left-1/2 md:max-w-2xl md:-translate-x-1/2 md:px-8">
                <button
                    onClick={handleVerify}
                    disabled={verifying || otp.some((d) => d === "")}
                    className="w-full cursor-pointer rounded-[18px] bg-[#135B47] py-4.5 text-[16px] font-semibold text-white shadow-md transition-colors hover:bg-[#0f4d3c] disabled:opacity-50"
                >
                    {verifying ? "Verifying..." : "Verify & Continue"}
                </button>
            </div>

            {/* Full Agreement Modal */}
            {showFullAgreement && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
                    <div className="animate-in slide-in-from-bottom-10 fade-in relative max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl sm:max-w-2xl sm:rounded-3xl">
                        <div className="sticky top-0 mb-4 flex items-center justify-between border-b bg-white pt-2 pb-2">
                            <h3 className="text-[18px] font-bold text-gray-900">
                                Vendor Service Agreement
                            </h3>
                            <button
                                onClick={() => setShowFullAgreement(false)}
                                className="-mr-2 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-4 pb-20 text-[14px] leading-relaxed text-gray-600">
                            <h4 className="text-center font-bold text-gray-900">
                                NON-DISCLOSURE & PRE-COLLABORATION INTENT AGREEMENT
                            </h4>
                            <p>
                                This Agreement is entered into on{" "}
                                <strong>{new Date().toLocaleDateString("en-IN")}</strong>, by and
                                between:
                            </p>

                            <p className="font-semibold text-gray-800">
                                Oneprovisiongrowth Pvt Ltd
                                <br />
                                <span className="font-normal">
                                    (Operating under the brand name Republic of Sabjiwala)
                                </span>
                                <br />
                                <span className="font-normal">PAN: AAECO7051N</span>
                                <br />
                                <span className="font-normal">CIN: U46301RJ2025PTC102143</span>
                                <br />
                                <span className="font-normal">
                                    (Hereinafter referred to as the “Company”)
                                </span>
                            </p>

                            <p className="text-center font-bold">AND</p>

                            <p className="font-semibold text-gray-800">
                                {vendorData?.vendor?.fullName || "[Vendor Name]"}
                                <br />
                                <span className="font-normal">
                                    Business Name: Store_{storeId?.substring(0, 8) || ""}
                                </span>
                                <br />
                                <span className="font-normal">
                                    (Hereinafter referred to as the “Vendor”)
                                </span>
                            </p>

                            <p>Collectively referred to as the “Parties”.</p>

                            <p className="font-bold text-gray-900">1. Purpose</p>
                            <p>
                                The Company has shared its business model, operational plan, and
                                collaboration structure with the Vendor. This Agreement is intended
                                to:
                            </p>
                            <ul className="list-disc space-y-1 pl-5">
                                <li>Protect the confidentiality of the shared information</li>
                                <li>
                                    Record the Vendor’s interest and intent to collaborate with the
                                    Company
                                </li>
                            </ul>

                            <p className="font-bold text-gray-900">2. Confidentiality</p>
                            <p>
                                The Vendor agrees that all information shared by the Company,
                                including business model, pricing, vendor structure, and operational
                                strategy, shall be treated as strictly confidential and shall not be
                                disclosed or used for any unauthorized purpose.
                            </p>

                            <p className="font-bold text-gray-900">
                                3. Acknowledgment of Discussion
                            </p>
                            <p>The Vendor confirms that:</p>
                            <ul className="list-disc space-y-1 pl-5">
                                <li>
                                    The Company has explained its business model and collaboration
                                    structure
                                </li>
                                <li>The Vendor has understood the concept and opportunity</li>
                            </ul>

                            <p className="font-bold text-gray-900">4. Expression of Intent</p>
                            <p>
                                The Vendor expresses a clear willingness and interest to collaborate
                                with the Company. The Vendor agrees that:
                            </p>
                            <ul className="list-disc space-y-1 pl-5">
                                <li>
                                    They are open to entering into a formal legal agreement with the
                                    Company
                                </li>
                                <li>
                                    They will not engage in any competing or conflicting activity
                                    using the shared information during this interim period
                                </li>
                            </ul>

                            <p className="font-bold text-gray-900">5. Interim Understanding</p>
                            <p>
                                Until a formal agreement is executed: Both Parties agree to proceed
                                in good faith. This document acts as a temporary understanding and
                                commitment of intent, not a final commercial agreement.
                            </p>

                            <p className="font-bold text-gray-900">6. Non-Circumvention</p>
                            <p>
                                The Vendor shall not: Copy, replicate, or misuse the Company’s
                                business model. Bypass or independently engage with any network,
                                vendor, or system introduced by the Company.
                            </p>

                            <p className="font-bold text-gray-900">7. Duration</p>
                            <p>
                                This Agreement shall remain valid for 6 (Six) months or until a
                                formal agreement is executed, whichever is earlier.
                            </p>

                            <p className="font-bold text-gray-900">8. Digital Acceptance</p>
                            <p>
                                This Agreement shall be considered valid upon Digital confirmation
                                (OTP). Such acceptance shall be legally valid under applicable
                                Indian laws, including the Information Technology Act, 2000.
                            </p>

                            <p className="font-bold text-gray-900">
                                9. Governing Law & Jurisdiction
                            </p>
                            <p>
                                This Agreement shall be governed by the laws of India. All disputes
                                shall be subject to the jurisdiction of courts located in Jaipur,
                                Rajasthan.
                            </p>
                        </div>

                        <div className="sticky bottom-0 bg-white pt-4 pb-2">
                            <button
                                onClick={() => setShowFullAgreement(false)}
                                className="w-full rounded-[14px] bg-[#135B47] py-3 text-[15px] font-semibold text-white shadow-md transition-colors hover:bg-[#0f4d3c]"
                            >
                                I understand
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
