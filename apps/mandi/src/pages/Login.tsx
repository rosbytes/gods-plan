import { useState, type ChangeEvent, type KeyboardEvent } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "@/libs/trpc"
import { useStore } from "@/store"
import { Button, Input } from "@/components/ui"

function RosOctagonLogo() {
    return (
        <svg
            width="74"
            height="64"
            viewBox="0 0 74 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-18.5 shrink-0"
        >
            {/* Chamfered Octagon Shape */}
            <path d="M24 0H50L74 20V44L50 64H24L0 44V20Z" fill="black" />
            {/* Top Text 'R' */}
            <text
                x="37"
                y="24"
                fill="white"
                fontSize="17"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                textAnchor="middle"
            >
                R
            </text>
            {/* Bottom Text 'O S' (using parenthesis styling for the O) */}
            <text
                x="28"
                y="46"
                fill="white"
                fontSize="17"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                textAnchor="middle"
            >
                (
            </text>
            <text
                x="34"
                y="46"
                fill="white"
                fontSize="17"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                textAnchor="middle"
            >
                )
            </text>
            <text
                x="47"
                y="46"
                fill="white"
                fontSize="17"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                textAnchor="middle"
            >
                S
            </text>
        </svg>
    )
}

export default function LoginPage() {
    const navigate = useNavigate()
    const login = useStore((state) => state.login)

    const [phone, setPhone] = useState("")
    const [pin, setPin] = useState("")
    const [phoneError, setPhoneError] = useState("")
    const [pinError, setPinError] = useState("")

    const loginMutation = trpc.auth.login.useMutation({
        onSuccess: (data) => {
            login(data.token)
            navigate("/", { replace: true })
        },
        onError: (error) => {
            const msg = error.message.toLowerCase()
            if (
                msg.includes("pin") ||
                msg.includes("invalid pin") ||
                msg.includes("unauthorized")
            ) {
                setPinError("Incorrect Password")
                setPin("")
            } else {
                setPhoneError("Invalid mobile number")
                setPhone("")
            }
        },
    })

    const bothFilled = phone.trim().length > 0 && pin.trim().length > 0
    const isLoading = loginMutation.isPending

    const onPhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value)
        setPhoneError("")
    }

    const onPinChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPin(e.target.value)
        setPinError("")
    }

    const handleLogin = () => {
        if (!bothFilled || isLoading) return
        let valid = true
        const trimmedPhone = phone.trim()

        // Basic client-side validation
        const allDigits = /^\d+$/.test(trimmedPhone)
        const isWithCountryCode =
            trimmedPhone.startsWith("+91") &&
            trimmedPhone.slice(3).length === 10 &&
            /^\d+$/.test(trimmedPhone.slice(3))

        if (!allDigits && !isWithCountryCode) {
            setPhoneError("Invalid mobile number")
            setPhone("")
            valid = false
        } else if (allDigits && trimmedPhone.length !== 10) {
            setPhoneError("Invalid mobile number")
            setPhone("")
            valid = false
        }

        if (pin.trim().length !== 4 || !/^\d{4}$/.test(pin.trim())) {
            setPinError("Incorrect Password")
            setPin("")
            valid = false
        }

        if (!valid) return

        // Format phone for API: if raw digits, prepend +91
        const formattedPhone = allDigits ? `+91${trimmedPhone}` : trimmedPhone

        loginMutation.mutate({ phone: formattedPhone, pin: pin.trim() })
    }

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleLogin()
    }

    return (
        <div className="flex min-h-screen bg-[#F4F5F8]">
            {/* Desktop Left Side Brand Panel (Visible on md and up) */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0B4E3E] p-12 text-white md:flex md:w-1/2">
                {/* Background decorative patterns */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-teal-200 via-teal-900 to-black opacity-10" />

                <header className="z-10">
                    <span className="font-apercu text-[24px] font-bold tracking-tight">
                        ROS Mandi 👋
                    </span>
                </header>

                <main className="z-10 mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-6 text-center">
                    <div className="mb-4 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-lg backdrop-blur-md">
                        <RosOctagonLogo />
                    </div>
                    <h1 className="font-apercu text-4xl leading-tight font-black tracking-tight lg:text-5xl">
                        Connecting Mandi Vendors Directly
                    </h1>
                    <p className="font-apercu text-lg leading-relaxed font-medium text-teal-100/90">
                        Manage your orders, process payments, and track pricing in real time with
                        the ROS Mandi vendor platform.
                    </p>
                </main>

                <footer className="z-10 text-sm font-medium text-teal-200/60">
                    © {new Date().getFullYear()} ROS Mandi. All rights reserved.
                </footer>
            </div>

            {/* Login Form Panel */}
            <div className="flex min-h-screen w-full flex-col items-center justify-between bg-[#F4F5F8] px-6 py-6 md:w-1/2 md:p-12">
                {/* Top Header - Mobile only */}
                <header className="w-full max-w-85 self-center pt-2 text-left md:hidden">
                    <span className="font-apercu flex items-center gap-1.5 text-[20px] font-bold text-[#111111]">
                        ROS Mandi 👋
                    </span>
                </header>

                {/* Central Form Container */}
                <main className="flex w-full max-w-85 flex-1 flex-col justify-center gap-8">
                    {/* Logo Section */}
                    <div className="flex justify-center">
                        <RosOctagonLogo />
                    </div>

                    {/* Inputs and Submit Button */}
                    <div className="flex flex-col gap-3">
                        <Input
                            type="text"
                            placeholder="ROS ID or mobile number"
                            error={phoneError}
                            value={phone}
                            onChange={onPhoneChange}
                            onKeyDown={onKeyDown}
                            autoComplete="username"
                            autoCapitalize="none"
                            spellCheck={false}
                            disabled={isLoading}
                        />

                        <Input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="Password"
                            error={pinError}
                            value={pin}
                            onChange={onPinChange}
                            onKeyDown={onKeyDown}
                            autoComplete="current-password"
                            disabled={isLoading}
                        />

                        <Button
                            onClick={handleLogin}
                            disabled={!bothFilled || isLoading}
                            isLoading={isLoading}
                        >
                            Log in
                        </Button>

                        <button
                            type="button"
                            className="font-apercu mt-2 cursor-pointer self-center border-none bg-transparent text-[16px] font-medium text-[#6B7280] transition-colors duration-150 outline-none hover:text-[#0B4E3E]"
                            onClick={() => {}}
                        >
                            Forgot Password?
                        </button>
                    </div>
                </main>

                {/* Footer Outlined Button */}
                <footer className="mt-8 w-full max-w-85 pb-4 md:mt-0">
                    <button
                        className="font-apercu h-13 w-full cursor-pointer rounded-xl border-[1.5px] border-[#0B4E3E] bg-transparent text-center text-[18px] font-semibold text-[#0B4E3E] transition-colors duration-150 outline-none hover:bg-[#0B4E3E]/5 active:bg-[#0B4E3E]/10"
                        type="button"
                    >
                        Become a mandi vendor
                    </button>
                </footer>
            </div>
        </div>
    )
}
