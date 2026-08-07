import { useState } from "react"
// import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button, Input } from "@ros/ui"
import { trpc } from "../lib/trpc"
import { useNavigate } from "react-router-dom"

export default function Login() {
    const navigate = useNavigate()
    const [phone, setPhone] = useState("")
    const [pin, setPin] = useState("")
    const [phoneError, setPhoneError] = useState("")
    const [pinError, setPinError] = useState("")

    const { mutate: login, isPending } = trpc.auth.login.useMutation({
        onSuccess: (data) => {
            toast.success(data.message || "Logged in successfully")
            navigate("/home")
        },
        onError: (error) => {
            const msg = error.message.toLowerCase()
            if (msg.includes("not found")) {
                setPhoneError("Invalid mobile number")
                setPinError("")
            } else if (msg.includes("pin")) {
                setPinError("Incorrect Password")
                setPhoneError("")
            } else {
                toast.error(error.message || "Failed to log in")
            }
        },
    })

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (!phone.trim() || !pin.trim()) {
            toast.error("Please enter both mobile number and pin")
            return
        }
        login({ phone, pin })
    }

    const isFormValid = phone.trim().length > 0 && pin.trim().length > 0

    return (
        <div className="flex min-h-screen flex-col bg-[#F8F9FA] px-6">
            {/* Header */}
            <div className="mt-12 w-full">
                <h1 className="text-xl font-bold tracking-tight text-gray-900">ROS Market</h1>
            </div>

            {/* Logo area */}
            <div className="mt-24 flex w-full flex-col items-center justify-center">
                <div
                    className="flex h-16 w-20 items-center justify-center bg-black"
                    style={{
                        clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                    }}
                >
                    <div className="flex flex-col items-center justify-center text-white">
                        <span className="text-xl leading-none font-bold">R</span>
                        <span className="text-xl leading-none font-bold tracking-widest">OS</span>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="mt-16 flex w-full flex-col gap-4">
                <Input
                    type="tel"
                    placeholder={phoneError || "Mobile number"}
                    value={phoneError ? "" : phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setPhoneError("")
                        setPhone(e.target.value)
                    }}
                    className={`h-14 rounded-xl px-4 text-base shadow-sm ring-0 focus-visible:ring-1 ${
                        phoneError
                            ? "!border-red-600 !text-red-600 !placeholder-red-600 focus-visible:!ring-red-600"
                            : "focus-visible:ring-primary border-none bg-white"
                    }`}
                    disabled={isPending}
                />

                <Input
                    type="password"
                    placeholder={pinError || "Password"}
                    value={pinError ? "" : pin}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setPinError("")
                        setPin(e.target.value)
                    }}
                    className={`h-14 rounded-xl px-4 text-base shadow-sm ring-0 focus-visible:ring-1 ${
                        pinError
                            ? "!border-red-600 !text-red-600 !placeholder-red-600 focus-visible:!ring-red-600"
                            : "focus-visible:ring-primary border-none bg-white"
                    }`}
                    disabled={isPending}
                />

                <Button
                    type="submit"
                    disabled={!isFormValid || isPending}
                    isLoading={isPending}
                    className="mt-2 h-14 w-full rounded-xl bg-[#0B4E3E] text-base font-semibold text-white hover:bg-[#07382d] disabled:bg-[#d9e5df] disabled:text-[#0B4E3E]/70 disabled:opacity-100"
                >
                    Log in
                </Button>
            </form>

            <div className="mt-6 flex w-full justify-center">
                <button
                    type="button"
                    className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                    Forgot Password?
                </button>
            </div>

            {/* Footer */}
            <div className="mt-auto mb-8 w-full pt-10">
                <Button
                    variant="outline"
                    className="h-14 w-full rounded-xl text-base font-semibold"
                >
                    Become a vendor
                </Button>
            </div>
        </div>
    )
}
