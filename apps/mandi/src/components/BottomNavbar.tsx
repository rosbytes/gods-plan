import { useLocation, Link } from "react-router-dom"

export const ACTIVE = "#0B4E3E"
export const INACTIVE = "#6B7280"

export function HomeIcon({ active }: { active: boolean }) {
    return (
        <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M8.73047 1.07217C10.6782 -0.357352 13.3267 -0.357425 15.2744 1.07217L21.9453 6.00478C23.2308 6.93615 23.9961 8.42511 24.0049 10.0136V18.9423C23.9221 21.8052 21.5461 24.0646 18.6855 24.0009H5.06445C2.31945 23.93 0.0801352 21.7207 0 18.9423V10.0136C0.00879261 8.42505 0.774004 6.93614 2.05957 6.00478L8.73047 1.07217Z"
                fill={active ? ACTIVE : "none"}
                stroke={active ? ACTIVE : INACTIVE}
                strokeWidth="1"
            />
            <path
                d="M6.31641 16.7538C5.79322 16.754 5.36914 17.1793 5.36914 17.703C5.36932 18.2266 5.79333 18.6511 6.31641 18.6513H17.6875C18.2106 18.6512 18.6346 18.2267 18.6348 17.703C18.6348 17.1792 18.2107 16.7539 17.6875 16.7538H6.31641Z"
                fill={active ? "white" : INACTIVE}
            />
        </svg>
    )
}

export function OrdersIcon({ active }: { active: boolean }) {
    return (
        <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M3.74157 18.5545C4.94119 20 7.17389 20 11.6393 20H12.3605C16.8259 20 19.0586 20 20.2582 18.5545C21.4578 17.1091 21.0464 14.9146 20.2235 10.5257C19.6382 7.40452 19.3456 5.84393 18.2347 4.92196C17.1238 4 15.5361 4 12.3605 4H11.6393C8.46374 4 6.87596 4 5.76506 4.92196C4.65416 5.84393 4.36155 7.40452 3.77633 10.5257C2.9534 14.9146 2.54194 17.1091 3.74157 18.5545Z"
                fill={active ? ACTIVE : "none"}
                stroke={active ? ACTIVE : INACTIVE}
                strokeWidth="1.5"
            />
            <path
                d="M9.1709 8C9.58273 9.16519 10.694 10 12.0002 10C13.3064 10 14.4177 9.16519 14.8295 8"
                stroke={active ? "white" : INACTIVE}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    )
}

export function FinanceIcon({ active }: { active: boolean }) {
    return active ? (
        <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M8.265 5.625H15.765L17.8125 1.5H6.1875L8.265 5.625Z" fill={ACTIVE} />
            <line
                x1="8.8"
                y1="5.625"
                x2="15.2"
                y2="5.625"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M6.945 22.5H17.055C18.575 22.5 19.8625 21.968 20.9175 20.904C21.9725 19.84 22.5 18.5565 22.5 17.0535C22.5 16.4155 22.3935 15.7955 22.1805 15.1935C21.9675 14.5915 21.655 14.0475 21.243 13.5615L15.873 7.125H8.163L2.787 13.5525C2.373 14.0405 2.055 14.5865 1.833 15.1905C1.611 15.7945 1.5 16.4155 1.5 17.0535C1.5 18.5555 2.0325 19.839 3.0975 20.904C4.1615 21.968 5.444 22.5 6.945 22.5Z"
                fill={ACTIVE}
            />
            <circle cx="12" cy="15.5" r="2" fill="white" />
        </svg>
    ) : (
        <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M8.265 5.625H15.765L17.8125 1.5H6.1875L8.265 5.625Z"
                stroke={INACTIVE}
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill="none"
            />
            <path
                d="M6.945 22.5H17.055C18.575 22.5 19.8625 21.968 20.9175 20.904C21.9725 19.84 22.5 18.5565 22.5 17.0535C22.5 16.4155 22.3935 15.7955 22.1805 15.1935C21.9675 14.5915 21.655 14.0475 21.243 13.5615L15.873 7.125H8.163L2.787 13.5525C2.373 14.0405 2.055 14.5865 1.833 15.1905C1.611 15.7945 1.5 16.4155 1.5 17.0535C1.5 18.5555 2.0325 19.839 3.0975 20.904C4.1615 21.968 5.444 22.5 6.945 22.5Z"
                stroke={INACTIVE}
                strokeWidth="1.5"
                fill="none"
            />
            <circle cx="12" cy="15.5" r="1.5" fill={INACTIVE} />
        </svg>
    )
}

export default function BottomNavbar() {
    const location = useLocation()
    const pathname = location.pathname

    const navItems = [
        { label: "Home", path: "/", Icon: HomeIcon },
        { label: "Orders", path: "/orders", Icon: OrdersIcon },
        { label: "Finance", path: "/finance", Icon: FinanceIcon },
    ]

    return (
        <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white">
            <div className="mx-auto flex h-18 max-w-107.5 items-center justify-around px-6">
                {navItems.map(({ label, path, Icon }) => {
                    const isActive =
                        label === "Home"
                            ? pathname === "/"
                            : pathname === path || pathname.startsWith(path)

                    return (
                        <Link
                            key={path}
                            to={path}
                            className="flex cursor-pointer flex-col items-center justify-center gap-1"
                        >
                            <Icon active={isActive} />
                            <span
                                className={`text-sm leading-5 font-semibold transition-colors duration-200 ${isActive ? "text-[#0A5445]" : "text-[#444444]"}`}
                            >
                                {label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
