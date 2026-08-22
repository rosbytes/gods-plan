import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { trpc } from "../lib/trpc"
import ROSLogo from "../assets/logo/ros-black.svg"
import { SpinnerIcon } from "../components/common/Icons"
import { PhoneInput } from "@ros/ui"
import { ForgotPinModal } from "../components/auth/ForgotPinModal"

export default function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const [rosId, setRosId] = useState("")
    const [password, setPassword] = useState("")
    const [isError, setIsError] = useState(false)
    const [isForgotPinOpen, setIsForgotPinOpen] = useState(false)

    // Check if user is already logged in
    const { data: currentUser } = trpc.auth.me.useQuery(undefined, {
        retry: false,
    })

    // Determine platform-safe return path
    const navigateBackOrDashboard = () => {
        const fromPath = location.state?.from?.pathname
        if (fromPath && fromPath !== "/login") {
            navigate(fromPath, { replace: true })
        } else if (
            window.history.length > 2 &&
            document.referrer &&
            document.referrer.includes(window.location.host)
        ) {
            navigate(-1)
        } else {
            navigate("/dashboard", { replace: true })
        }
    }

    // Auto-redirect if session is already active
    useEffect(() => {
        if (currentUser) {
            navigateBackOrDashboard()
        }
    }, [currentUser])

    const loginMutation = trpc.auth.login.useMutation({
        onSuccess: () => {
            setIsError(false)
            navigateBackOrDashboard()
        },
        onError: () => {
            setIsError(true)
            setPassword("Incorrect Password")
        },
    })

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!rosId || !password) return
        loginMutation.mutate({ phone: rosId, pin: password })
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isError) {
            setIsError(false)
            setPassword(e.target.value.replace("Incorrect Password", ""))
        } else {
            setPassword(e.target.value)
        }
    }

    return (
        <>
            {/* ========================================================================= */}
            {/* MOBILE LOGIN VIEW (< 1024px) — 100% PRESERVED ORIGINAL MOBILE DESIGN      */}
            {/* ========================================================================= */}
            <div className="relative flex min-h-screen flex-col bg-[#F7F8FA] font-sans text-gray-800 lg:hidden">
                {/* Header */}
                <div className="absolute top-6 left-6 flex items-center gap-1.5 text-xl font-bold tracking-tight text-gray-900">
                    ROS Admin <span className="mb-1 text-[1.3rem] leading-none">👋</span>
                </div>

                {/* Main Content Container */}
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
                    <div className="flex w-full max-w-90 flex-col items-center rounded-3xl border border-gray-100 bg-white p-6 shadow-xl sm:max-w-md sm:p-10">
                        {/* Logo */}
                        <img
                            src={ROSLogo}
                            alt="ROS Logo"
                            className="mb-8 flex h-20 w-20 flex-col items-center justify-center bg-transparent leading-none text-white sm:mb-10 sm:h-24 sm:w-24"
                        />

                        {/* Login Form */}
                        <form className="flex w-full flex-col gap-4" onSubmit={handleLogin}>
                            <div>
                                <PhoneInput
                                    value={rosId}
                                    onChange={(val, meta) => setRosId(meta.e164 || val)}
                                    defaultCountry="IN"
                                    placeholder="Mobile number"
                                />
                            </div>

                            <div>
                                <input
                                    type={isError ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className={`w-full rounded-[14px] border px-4 py-3.5 shadow-xs transition-all focus:outline-none ${
                                        isError
                                            ? "border-[#b93246] bg-white text-[#b93246] focus:ring-2 focus:ring-[#b93246]"
                                            : "border-gray-100 bg-gray-50/50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#135B47]"
                                    }`}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loginMutation.isPending}
                                className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[#135B47] py-3.5 text-[15px] font-semibold text-white shadow-xs transition-colors hover:bg-[#0f4d3c] active:bg-[#0a3f31] disabled:opacity-60"
                            >
                                {loginMutation.isPending ? (
                                    <>
                                        <SpinnerIcon size={18} />
                                        <span>Logging in...</span>
                                    </>
                                ) : (
                                    "Log in"
                                )}
                            </button>

                            <div className="mt-3 text-center">
                                <button
                                    type="button"
                                    onClick={() => setIsForgotPinOpen(true)}
                                    className="cursor-pointer text-[15px] font-medium text-gray-500 transition-colors hover:text-gray-800"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* DESKTOP LOGIN VIEW (>= 1024px) — BALANCED, CLEAN & PROFESSIONAL          */}
            {/* ========================================================================= */}
            <div className="hidden min-h-screen items-center justify-center bg-[#F1F5F9] p-8 font-sans lg:flex">
                <div className="flex w-full max-w-4xl overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-2xl">
                    {/* Left Pane — Emerald Hero Panel */}
                    <div className="relative flex flex-1 flex-col justify-between bg-linear-to-br from-[#0F382C] via-[#135B47] to-[#0A2E24] p-10 text-white">
                        {/* Top Branding */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-lg font-bold text-white backdrop-blur-md">
                                R
                            </div>
                            <span className="text-xl font-black tracking-tight text-white">
                                ROS Admin
                            </span>
                        </div>

                        {/* Middle Content */}
                        <div className="my-auto py-8">
                            <span className="mb-4 inline-block rounded-full border border-emerald-400/30 bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                                Portal Version 2.4
                            </span>
                            <h2 className="text-3xl leading-tight font-extrabold tracking-tight text-white">
                                Regional Operations & Supply Administration
                            </h2>
                            <p className="mt-3 max-w-sm text-sm leading-relaxed font-medium text-emerald-100/80">
                                Centralized management portal for vendor onboardings, mandi
                                geolocation mapping, and produce catalog controls.
                            </p>

                            <div className="mt-8 space-y-3">
                                <div className="flex items-center gap-3 text-xs font-semibold text-emerald-100">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                                        ✓
                                    </span>
                                    <span>Real-time Multi-Vendor Management</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-semibold text-emerald-100">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                                        ✓
                                    </span>
                                    <span>Geospatial Mandi Coordinates</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-semibold text-emerald-100">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                                        ✓
                                    </span>
                                    <span>Encrypted Role-Based Security</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Footer */}
                        <div className="text-[11px] font-medium text-emerald-300/60">
                            © 2026 ROS Operations Inc. All rights reserved.
                        </div>
                    </div>

                    {/* Right Pane — Professional Login Form */}
                    <div className="flex w-full max-w-md flex-col justify-center bg-white p-10">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                                Admin Sign In
                            </h3>
                            <p className="mt-1 text-xs font-medium text-gray-400">
                                Enter your credentials to access the workspace
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <PhoneInput
                                    label="Registered Phone Number"
                                    value={rosId}
                                    onChange={(val, meta) => setRosId(meta.e164 || val)}
                                    defaultCountry="IN"
                                    placeholder="Enter your registered phone"
                                />
                            </div>

                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label className="text-xs font-semibold text-gray-600">
                                        Password / PIN
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotPinOpen(true)}
                                        className="cursor-pointer text-xs font-semibold text-[#135B47] hover:underline"
                                    >
                                        Forgot PIN?
                                    </button>
                                </div>
                                <input
                                    type={isError ? "text" : "password"}
                                    placeholder="Enter your secret PIN"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold transition-colors focus:outline-none ${
                                        isError
                                            ? "border-red-500 bg-red-50/30 text-red-600 focus:border-red-500"
                                            : "border-gray-200 bg-gray-50/50 text-gray-800 placeholder:text-gray-400 focus:border-[#135B47] focus:bg-white"
                                    }`}
                                />
                                {isError && (
                                    <p className="mt-1.5 text-xs font-medium text-red-500">
                                        Incorrect credentials. Please verify your phone & PIN.
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loginMutation.isPending || !rosId || !password}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#135B47] py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#0f4d3c] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loginMutation.isPending ? (
                                    <>
                                        <SpinnerIcon size={18} />
                                        <span>Authenticating...</span>
                                    </>
                                ) : (
                                    "Sign In to Dashboard →"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Forgot PIN Modal */}
            <ForgotPinModal
                isOpen={isForgotPinOpen}
                onClose={() => setIsForgotPinOpen(false)}
                initialPhone={rosId}
                onSuccess={(phone) => {
                    setRosId(phone)
                    setPassword("")
                    setIsError(false)
                }}
            />
        </>
    )
}
