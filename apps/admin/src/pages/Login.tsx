import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"
import ROSLogo from "../assets/logo/ros-black.svg"

export default function Login() {
    const navigate = useNavigate()
    const [rosId, setRosId] = useState("")
    const [password, setPassword] = useState("")
    const [isError, setIsError] = useState(false)

    const loginMutation = trpc.auth.login.useMutation({
        onSuccess: () => {
            setIsError(false)
            // Navigate to dashboard automatically on success
            navigate("/dashboard")
        },
        onError: () => {
            setIsError(true)
            setPassword("Incorrect Password")
        },
    })

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
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
        <div className="relative flex min-h-screen flex-col bg-[#F7F8FA] font-sans text-gray-800">
            {/* Header */}
            <div className="absolute top-6 left-6 flex items-center gap-1.5 text-xl font-bold tracking-tight text-gray-900">
                ROS Admin <span className="mb-1 text-[1.3rem] leading-none">👋</span>
            </div>

            {/* Main Content Container */}
            <div className="flex flex-1 flex-col items-center justify-center px-6">
                {/* Logo */}
                {/* <div
                    className="mb-12 flex h-20 w-20 flex-col items-center justify-center bg-black leading-none text-white"
                    style={{
                        clipPath: "polygon(28% 0%, 72% 0%, 100% 50%, 72% 100%, 28% 100%, 0% 50%)",
                    }}
                >
                    <div className="mt-1 mb-0.5 text-[1.4rem] font-bold tracking-wider">R</div>
                    <div className="flex items-center text-[1.3rem] font-bold tracking-widest">
                        <span className="mr-[1px] tracking-tighter">()</span>S
                    </div>
                </div> */}
                <img
                    src={ROSLogo}
                    className="mb-12 flex h-20 w-20 flex-col items-center justify-center bg-transparent leading-none text-white"
                />

                {/* Login Form */}
                <form className="flex w-full max-w-[320px] flex-col gap-4" onSubmit={handleLogin}>
                    <div>
                        <input
                            type="text"
                            placeholder="ROS ID or mobile number"
                            value={rosId}
                            onChange={(e) => setRosId(e.target.value)}
                            className="w-full rounded-[14px] border border-gray-100 bg-white px-4 py-3.5 text-gray-800 placeholder-gray-400 shadow-sm transition-all focus:ring-2 focus:ring-[#135B47] focus:outline-none"
                        />
                    </div>

                    <div>
                        <input
                            type={isError ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={handlePasswordChange}
                            className={`w-full rounded-[14px] border bg-white px-4 py-3.5 shadow-sm transition-all focus:outline-none ${
                                isError
                                    ? "border-[#b93246] text-[#b93246] focus:ring-2 focus:ring-[#b93246]"
                                    : "border-gray-100 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#135B47]"
                            }`}
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-1 w-full rounded-[14px] bg-[#135B47] py-3.5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0f4d3c] active:bg-[#0a3f31]"
                    >
                        Log in
                    </button>

                    <div className="mt-3 text-center">
                        <button
                            type="button"
                            className="text-[15px] font-medium text-gray-500 transition-colors hover:text-gray-800"
                        >
                            Forgot Password?
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
