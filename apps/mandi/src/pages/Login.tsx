import { useState, type ChangeEvent, type KeyboardEvent } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "@/libs/trpc"
import { useStore } from "@/store"

export default function LoginPage() {
    const navigate = useNavigate()
    const login = useStore((state) => state.login)

    const [phone, setPhone] = useState("")
    const [pin, setPin] = useState("")
    const [phoneError, setPhoneError] = useState("")
    const [pinError, setPinError] = useState("")

    const loginMutation = trpc.auth.login.useMutation({
        onSuccess: (_data, _vars, _ctx) => {
            // The API sets the token in the Authorization header.
            // For now we store a placeholder token — once the backend
            // returns the token in the response body, use that instead.
            login("authenticated")
            navigate("/", { replace: true })
        },
        onError: (error) => {
            const msg = error.message
            if (msg.toLowerCase().includes("pin")) {
                setPinError("Incorrect PIN")
                setPin("")
            } else {
                setPhoneError(msg || "Login failed")
                setPhone("")
            }
        },
    })

    const bothFilled = phone.trim().length > 0 && pin.trim().length > 0

    const onPhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value)
        setPhoneError("")
    }

    const onPinChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPin(e.target.value)
        setPinError("")
    }

    const handleLogin = () => {
        if (!bothFilled) return
        let valid = true
        const trimmedPhone = phone.trim()

        // Basic client-side validation
        const allDigits = /^\d+$/.test(trimmedPhone)
        if (allDigits && trimmedPhone.length !== 10) {
            setPhoneError("Invalid mobile number")
            setPhone("")
            valid = false
        } else if (
            !allDigits &&
            (!/^[A-Za-z0-9]+$/.test(trimmedPhone) ||
                !trimmedPhone.startsWith("ROS") ||
                trimmedPhone.length !== 10)
        ) {
            setPhoneError("Invalid ROS ID")
            setPhone("")
            valid = false
        }

        if (pin.trim().length !== 4 || !/^\d{4}$/.test(pin.trim())) {
            setPinError("PIN must be 4 digits")
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

    const inputBase =
        "block w-[324px] h-[50px] px-4 rounded-xl outline-none appearance-none transition-colors duration-150 " +
        "font-apercu font-normal text-[20px] leading-[24px] tracking-[0] box-border"

    const inputNormal =
        inputBase +
        " border-[1.5px] border-transparent bg-white text-[#111111] " +
        "placeholder:text-[#AEAFB8] focus:border-[#3D7A6A] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"

    const inputError =
        inputBase +
        " border-[1.5px] border-[#C8383A] bg-white text-[#C8383A] " +
        "placeholder:text-[#C8383A] focus:border-[#C8383A] focus:shadow-[0_0_0_3px_rgba(200,56,58,0.09)]"

    const isLoading = loginMutation.isPending

    return (
        <div className="flex min-h-screen items-stretch justify-center bg-[#EDEEF2] sm:items-center sm:bg-[#D8D9DE]">
            <div className="relative box-border flex min-h-dvh w-full max-w-107.5 flex-col bg-[#EDEEF2] px-11 sm:shadow-[0_0_60px_rgba(0,0,0,0.18)]">
                <header className="pt-4.5 pb-0">
                    <span className="font-apercu text-[20px] leading-6 font-bold tracking-normal text-[#111111]">
                        ROS Mandi 👋
                    </span>
                </header>

                <main className="flex flex-1 flex-col justify-center pb-27.5">
                    <div className="mb-12 flex items-center justify-center">
                        <img
                            src="/assets/images/roslogo.png"
                            alt="ROS Mandi"
                            width={72}
                            height={60}
                            className="h-15 w-18 object-contain"
                        />
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <input
                            className={phoneError ? inputError : inputNormal}
                            type="text"
                            placeholder={phoneError || "Phone number (+91...)"}
                            value={phone}
                            onChange={onPhoneChange}
                            onKeyDown={onKeyDown}
                            autoComplete="username"
                            autoCapitalize="none"
                            spellCheck={false}
                            disabled={isLoading}
                        />
                        <input
                            className={pinError ? inputError : inputNormal}
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder={pinError || "4-digit PIN"}
                            value={pin}
                            onChange={onPinChange}
                            onKeyDown={onKeyDown}
                            autoComplete="current-password"
                            disabled={isLoading}
                        />
                        <button
                            className={
                                "box-border block h-12.5 w-81 rounded-xl border-none outline-none " +
                                "font-apercu text-[20px] leading-6 font-bold " +
                                "text-center tracking-normal transition-all duration-150 " +
                                (bothFilled && !isLoading
                                    ? "cursor-pointer bg-[#1E5C50] text-white hover:bg-[#185044] active:scale-[0.990] active:bg-[#144038]"
                                    : "pointer-events-none cursor-default bg-[#DAE6E3] text-[#4A7A6E]")
                            }
                            onClick={handleLogin}
                            type="button"
                            disabled={!bothFilled || isLoading}
                        >
                            {isLoading ? "Logging in..." : "Log in"}
                        </button>
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={() => {}}
                            onKeyDown={(e) => e.key === "Enter" && {}}
                            className={
                                "font-apercu text-[18px] leading-5.5 font-normal " +
                                "mt-1 cursor-pointer py-1.5 text-center tracking-normal text-[#7A7C85] " +
                                "transition-colors duration-150 select-none hover:text-[#1E5C50]"
                            }
                        >
                            Forgot Password?
                        </span>
                    </div>
                </main>

                <div className="fixed bottom-0 left-1/2 box-border flex w-full max-w-107.5 -translate-x-1/2 justify-center bg-[#EDEEF2] px-5 pt-3 pb-8">
                    <button
                        className={
                            "block h-12.5 w-81 rounded-xl border-[1.5px] border-[#3D7A6A] " +
                            "box-border cursor-pointer bg-transparent text-[#1E5C50] outline-none " +
                            "font-apercu text-[20px] leading-6 font-normal " +
                            "text-center tracking-normal transition-colors duration-150 " +
                            "hover:bg-[rgba(61,122,106,0.07)] active:bg-[rgba(61,122,106,0.14)]"
                        }
                        type="button"
                    >
                        Become a mandi vendor
                    </button>
                </div>
            </div>
        </div>
    )
}
