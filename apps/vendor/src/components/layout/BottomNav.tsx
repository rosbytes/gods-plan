import { NavLink } from "react-router-dom"
import { Icon } from "@iconify/react"

const navItems = [
    {
        name: "Home",
        path: "/home",
        iconDefault: "fluent:home-24-regular",
        iconActive: "fluent:home-24-filled",
    },
    {
        name: "Pickup",
        path: "/pickup",
        iconDefault: "mdi:truck-outline",
        iconActive: "mdi:truck",
    },
    {
        name: "Orders",
        path: "/orders",
        iconDefault: "fluent:shopping-bag-24-regular",
        iconActive: "fluent:shopping-bag-24-filled",
    },
]

export function BottomNav() {
    return (
        <div className="pb-safe fixed right-0 bottom-0 left-0 z-50 flex h-[72px] w-full items-center justify-around border-t border-gray-200 bg-white">
            {navItems.map((item) => (
                <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }: { isActive: boolean }) =>
                        `flex w-20 flex-col items-center justify-center gap-1 transition-colors ${
                            isActive ? "text-[#0B4E3E]" : "text-gray-500 hover:text-gray-900"
                        }`
                    }
                >
                    {({ isActive }: { isActive: boolean }) => (
                        <>
                            <Icon
                                icon={isActive ? item.iconActive : item.iconDefault}
                                className="h-6 w-6"
                            />
                            <span className="text-xs font-semibold">{item.name}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </div>
    )
}
