import { useState, type ChangeEvent, type KeyboardEvent } from "react"

export default function LoginPage() {
    const [rosId, setRosId] = useState("")
    const [password, setPassword] = useState("")
    const [rosIdError, setRosIdError] = useState("")
    const [passwordError, setPasswordError] = useState("")

    const bothFilled = rosId.trim().length > 0 && password.trim().length > 0

    const onRosIdChange = (e: ChangeEvent<HTMLInputElement>) => {
        setRosId(e.target.value)
        setRosIdError("")
    }

    const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
        setPasswordError("")
    }

    const handleLogin = () => {
        if (!bothFilled) return
        let valid = true
        const trimmed = rosId.trim()
        const allDigits = /^\d+$/.test(trimmed)

        if (allDigits && trimmed.length !== 10) {
            setRosIdError("Invalid mobile number")
            setRosId("")
            valid = false
        } else if (
            !allDigits &&
            (!/^[A-Za-z0-9]+$/.test(trimmed) || !trimmed.startsWith("ROS") || trimmed.length !== 10)
        ) {
            setRosIdError("Invalid ROS ID")
            setRosId("")
            valid = false
        }

        if (password.trim().length < 4) {
            setPasswordError("Incorrect Password")
            setPassword("")
            valid = false
        }

        if (valid) {
            console.log("Login:", rosId, password)
        }
    }

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleLogin()
    }

    const inputBase =
        "block w-[324px] h-[50px] px-4 rounded-xl outline-none appearance-none transition-colors duration-150 " +
        '[font-family:"Apercu_Pro",sans-serif] font-normal text-[20px] leading-[24px] tracking-[0] box-border'

    const inputNormal =
        inputBase +
        " border-[1.5px] border-transparent bg-white text-[#111111] " +
        "placeholder:text-[#AEAFB8] focus:border-[#3D7A6A] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"

    const inputError =
        inputBase +
        " border-[1.5px] border-[#C8383A] bg-white text-[#C8383A] " +
        "placeholder:text-[#C8383A] focus:border-[#C8383A] focus:shadow-[0_0_0_3px_rgba(200,56,58,0.09)]"

    return (
        <div
            className={
                "flex min-h-screen items-stretch justify-center bg-[#EDEEF2] sm:items-center sm:bg-[#D8D9DE]"
            }
        >
            <div
                className={
                    "relative box-border flex min-h-dvh w-full max-w-107.5 flex-col bg-[#EDEEF2] px-11 sm:shadow-[0_0_60px_rgba(0,0,0,0.18)]"
                }
            >
                <header className="pt-4.5 pb-0">
                    <span
                        className={
                            'font-["Apercu_Pro",sans-serif] text-[20px] leading-6 font-bold tracking-normal text-[#111111]'
                        }
                    >
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
                            className={rosIdError ? inputError : inputNormal}
                            type="text"
                            placeholder={rosIdError || "ROS ID or mobile number"}
                            value={rosId}
                            onChange={onRosIdChange}
                            onKeyDown={onKeyDown}
                            autoComplete="username"
                            autoCapitalize="none"
                            spellCheck={false}
                        />
                        <input
                            className={passwordError ? inputError : inputNormal}
                            type="password"
                            placeholder={passwordError || "Password"}
                            value={password}
                            onChange={onPasswordChange}
                            onKeyDown={onKeyDown}
                            autoComplete="current-password"
                        />
                        <button
                            className={
                                "box-border block h-12.5 w-81 rounded-xl border-none outline-none " +
                                'font-["Apercu_Pro",sans-serif] text-[20px] leading-6 font-bold ' +
                                "text-center tracking-normal transition-all duration-150 " +
                                (bothFilled
                                    ? "cursor-pointer bg-[#1E5C50] text-white hover:bg-[#185044] active:scale-[0.990] active:bg-[#144038]"
                                    : "pointer-events-none cursor-default bg-[#DAE6E3] text-[#4A7A6E]")
                            }
                            onClick={handleLogin}
                            type="button"
                            disabled={!bothFilled}
                        >
                            Log in
                        </button>
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={() => {}}
                            onKeyDown={(e) => e.key === "Enter" && {}}
                            className={
                                'font-["Apercu_Pro",sans-serif] text-[18px] leading-5.5 font-normal ' +
                                "mt-1 cursor-pointer py-1.5 text-center tracking-normal text-[#7A7C85] " +
                                "transition-colors duration-150 select-none hover:text-[#1E5C50]"
                            }
                        >
                            Forgot Password?
                        </span>
                    </div>
                </main>

                <div
                    className={
                        "fixed bottom-0 left-1/2 box-border flex w-full max-w-107.5 -translate-x-1/2 justify-center bg-[#EDEEF2] px-5 pt-3 pb-8"
                    }
                >
                    <button
                        className={
                            "block h-12.5 w-81 rounded-xl border-[1.5px] border-[#3D7A6A] " +
                            "box-border cursor-pointer bg-transparent text-[#1E5C50] outline-none " +
                            'font-["Apercu_Pro",sans-serif] text-[20px] leading-6 font-normal ' +
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
