import { useNavigate } from "react-router-dom"
import { BackArrowIcon } from "@/components/icons"
import { useAuth } from "@/store/auth-context"

// ─── Page-specific icons (only used here) ───────────────────────────
function HeadsetIcon() {
    return (
        <svg
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M5.61538 13.0006V8.14543C5.6298 7.19108 5.8324 6.24895 6.21158 5.37302C6.59075 4.49709 7.13905 3.70459 7.82504 3.04092C8.51104 2.37725 9.32126 1.85546 10.2093 1.50544C11.0973 1.15542 12.0456 0.984056 13 1.00117C13.9544 0.984056 14.9027 1.15542 15.7907 1.50544C16.6787 1.85546 17.489 2.37725 18.175 3.04092C18.861 3.70459 19.4092 4.49709 19.7884 5.37302C20.1676 6.24895 20.3702 7.19108 20.3846 8.14543V13.0006M16.6923 22.6924C17.6716 22.6924 18.6107 22.3034 19.3032 21.611C19.9956 20.9186 20.3846 19.9795 20.3846 19.0003V14.8466M16.6923 22.6924C16.6923 23.3044 16.4492 23.8914 16.0164 24.3241C15.5836 24.7569 14.9967 25 14.3846 25H11.6154C11.0033 25 10.4164 24.7569 9.9836 24.3241C9.55082 23.8914 9.30769 23.3044 9.30769 22.6924C9.30769 22.0804 9.55082 21.4935 9.9836 21.0607C10.4164 20.628 11.0033 20.3848 11.6154 20.3848H14.3846C14.9967 20.3848 15.5836 20.628 16.0164 21.0607C16.4492 21.4935 16.6923 22.0804 16.6923 22.6924ZM2.84615 10.2315H4.69231C4.93712 10.2315 5.17191 10.3287 5.34502 10.5018C5.51813 10.6749 5.61538 10.9097 5.61538 11.1545V16.6927C5.61538 16.9375 5.51813 17.1723 5.34502 17.3454C5.17191 17.5185 4.93712 17.6157 4.69231 17.6157H2.84615C2.35652 17.6157 1.88695 17.4212 1.54073 17.075C1.1945 16.7288 1 16.2593 1 15.7697V12.0776C1 11.5879 1.1945 11.1184 1.54073 10.7722C1.88695 10.426 2.35652 10.2315 2.84615 10.2315ZM23.1538 17.6157H21.3077C21.0629 17.6157 20.8281 17.5185 20.655 17.3454C20.4819 17.1723 20.3846 16.9375 20.3846 16.6927V11.1545C20.3846 10.9097 20.4819 10.6749 20.655 10.5018C20.8281 10.3287 21.0629 10.2315 21.3077 10.2315H23.1538C23.6435 10.2315 24.1131 10.426 24.4593 10.7722C24.8055 11.1184 25 11.5879 25 12.0776V15.7697C25 16.2593 24.8055 16.7288 24.4593 17.075C24.1131 17.4212 23.6435 17.6157 23.1538 17.6157Z"
                stroke="#444444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function DocumentIcon() {
    return (
        <svg
            width="20"
            height="24"
            viewBox="0 0 20 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M4.6508 8.77708H12.4604C12.8951 8.72629 13.2229 8.358 13.2229 7.92035C13.2229 7.4827 12.8951 7.11441 12.4604 7.06362H4.6508C4.32086 7.02507 3.9981 7.17942 3.82099 7.46044C3.64387 7.74147 3.64387 8.09923 3.82099 8.38026C3.9981 8.66128 4.32086 8.81563 4.6508 8.77708Z"
                fill="#444444"
            />
            <path
                d="M4.6508 18.102H10.2224C10.5524 18.1405 10.8751 17.9862 11.0523 17.7052C11.2294 17.4241 11.2294 17.0664 11.0523 16.7854C10.8751 16.5043 10.5524 16.35 10.2224 16.3885H4.6508C4.32086 16.35 3.9981 16.5043 3.82099 16.7854C3.64387 17.0664 3.64387 17.4241 3.82099 17.7052C3.9981 17.9862 4.32086 18.1405 4.6508 18.102Z"
                fill="#444444"
            />
            <path
                d="M14.6867 13.4395H4.6508C4.32086 13.4781 3.9981 13.3237 3.82099 13.0427C3.64387 12.7617 3.64387 12.4039 3.82099 12.1229C3.9981 11.8419 4.32086 11.6875 4.6508 11.7261H14.6867C15.1214 11.7769 15.4492 12.1452 15.4492 12.5828C15.4492 13.0205 15.1214 13.3887 14.6867 13.4395Z"
                fill="#444444"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M13.7426 24H5.58329C2.49784 23.9936 -6.69585e-06 21.4905 0 18.4051V5.58329C0.0064119 2.50239 2.50239 0.0064119 5.58329 0H13.7426C16.8281 -6.69585e-06 19.3311 2.49784 19.3375 5.58329V18.4051C19.3375 19.8889 18.7481 21.312 17.6988 22.3613C16.6496 23.4105 15.2265 24 13.7426 24ZM5.58329 1.85333C3.52594 1.85973 1.85973 3.52595 1.85333 5.58329V18.4051C1.85332 20.4669 3.5214 22.1402 5.58329 22.1467H13.7426C15.809 22.1467 17.4842 20.4715 17.4842 18.4051V5.58329C17.4778 3.52141 15.8045 1.85332 13.7426 1.85333H5.58329Z"
                fill="#444444"
            />
        </svg>
    )
}

// ─── Info Row Component ─────────────────────────────────────────────
function InfoRow({
    label,
    value,
    hasBorder = true,
}: {
    label: string
    value: React.ReactNode
    hasBorder?: boolean
}) {
    return (
        <div className={hasBorder ? "border-t border-[#F2F3F6] pt-4" : ""}>
            <p className="font-apercu text-[16px] font-semibold text-[#999999]">{label}</p>
            <p className="font-apercu text-[20px] font-bold text-[#444444]">{value}</p>
        </div>
    )
}

export default function Profile() {
    const navigate = useNavigate()
    const { logout } = useAuth()

    const handleLogout = () => {
        logout()
        navigate("/login", { replace: true })
    }

    return (
        <div className="relative mx-auto min-h-screen max-w-[412px] bg-[#F2F3F6] pb-10">
            <div className="h-[24px]" />

            {/* Top Bar */}
            <div className="flex items-center gap-3 bg-[#F2F3F6] px-5 py-3">
                <button
                    onClick={() => navigate(-1)}
                    className="shrink-0 cursor-pointer border-none bg-transparent p-1"
                >
                    <BackArrowIcon />
                </button>
                <h1 className="font-apercu text-[20px] font-bold text-[#000000]">Profile</h1>
            </div>

            {/* Vendor Details Card */}
            <div className="mx-5 mt-4 rounded-[12px] bg-white p-5">
                <div className="mb-4 flex items-center gap-4">
                    <div className="h-[48px] w-[48px] shrink-0 overflow-hidden rounded-full bg-[#CBD5E1]">
                        <img
                            src="/assets/images/profile.jpg"
                            alt="Sachin Tichkule"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <p className="font-apercu text-[20px] font-bold text-[#000000]">
                            Sachin Tichkule
                        </p>
                        <p className="font-apercu text-[16px] font-normal text-[#444444]">
                            Id: ROS402
                        </p>
                    </div>
                </div>
                <InfoRow
                    label="Manage"
                    value={<span className="text-[#0A5445]">Potato/ आलू</span>}
                />
            </div>

            {/* Business Details Card */}
            <div className="mx-5 mt-4 rounded-[12px] bg-white p-5">
                <div className="mb-4">
                    <p className="font-apercu text-[16px] font-semibold text-[#999999]">Shop</p>
                    <p className="font-apercu text-[20px] font-bold text-[#444444]">
                        Ze-bros Vegetables
                    </p>
                </div>
                <InfoRow
                    label="Address"
                    value={
                        <>
                            Shop no 33, Potato Block,
                            <br />
                            Muhana Mandi, Jaipur, 302029
                        </>
                    }
                />
            </div>

            {/* KYC Card */}
            <div className="mx-5 mt-4 rounded-[12px] bg-white p-5">
                <p className="font-apercu text-[16px] font-semibold text-[#999999]">KYC Status</p>
                <p className="font-apercu text-[20px] font-bold text-[#444444]">
                    Verified: Aadhar Card
                </p>
            </div>

            {/* Contact Details Card */}
            <div className="mx-5 mt-4 rounded-[12px] bg-white p-5">
                <div className="mb-4">
                    <p className="font-apercu text-[16px] font-semibold text-[#999999]">Primary</p>
                    <p className="font-apercu text-[20px] font-bold text-[#444444]">
                        +91 925126211
                    </p>
                </div>
                <InfoRow label="Alternate" value="+91 926226211" />
            </div>

            {/* Bank Details Card */}
            <div className="mx-5 mt-4 rounded-[12px] bg-white p-5">
                <div className="mb-4">
                    <p className="font-apercu text-[16px] font-semibold text-[#999999]">
                        Settlement Account
                    </p>
                    <p className="font-apercu text-[20px] font-bold text-[#444444]">
                        6969 0420 0007 1971
                    </p>
                </div>
                <div className="mb-4 border-t border-[#F2F3F6] pt-4">
                    <p className="font-apercu text-[16px] font-semibold text-[#999999]">
                        IFSC Code
                    </p>
                    <p className="font-apercu text-[20px] font-bold text-[#444444]">LOKI0013</p>
                </div>
                <InfoRow label="Account Name" value="Ze-bros Pvt. Ltd." />
            </div>

            {/* More Section */}
            <div className="mx-5 mt-4 overflow-hidden rounded-[12px] bg-white">
                <button className="flex w-full items-center gap-5 border-b border-[#F2F3F6] px-5 py-4">
                    <HeadsetIcon />
                    <span className="font-apercu text-[20px] font-bold text-[#444444]">
                        Customer Support
                    </span>
                </button>
                <button className="flex w-full items-center gap-5 px-5 py-4">
                    <DocumentIcon />
                    <span className="font-apercu text-[20px] font-bold text-[#444444]">
                        Terms & Conditions
                    </span>
                </button>
            </div>

            {/* Logout Button */}
            <div className="mx-5 mt-4">
                <button
                    onClick={handleLogout}
                    className="font-apercu flex h-12.5 w-full cursor-pointer items-center justify-center rounded-xl border-[1.5px] border-[#E21931] bg-transparent text-[18px] font-bold text-[#E21931] transition-colors hover:bg-[rgba(226,25,49,0.05)]"
                >
                    Log out
                </button>
            </div>
        </div>
    )
}
