import { useState, useRef, useEffect } from "react"

interface Tab {
    label: string
    time?: string
}

interface SlotTabsProps {
    tabs: Tab[]
    onTabChange?: (index: number) => void
}

export default function SlotTabs({ tabs = [], onTabChange }: SlotTabsProps) {
    const [activeTab, setActiveTab] = useState(0)
    const scrollRef = useRef<HTMLDivElement>(null)

    const handleTabClick = (index: number) => {
        setActiveTab(index)
        onTabChange?.(index)
    }

    useEffect(() => {
        if (scrollRef.current) {
            const el = scrollRef.current.children[activeTab] as HTMLElement
            el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
        }
    }, [activeTab])

    return (
        <div className="bg-[#F2F3F6] px-4 py-3">
            <div
                ref={scrollRef}
                className="scrollbar-hide flex gap-2 overflow-x-auto"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {tabs.map((tab, index) => {
                    const isActive = activeTab === index
                    return (
                        <button
                            key={index}
                            onClick={() => handleTabClick(index)}
                            className={`flex-shrink-0 cursor-pointer rounded-full border-none px-5 py-2 text-[15px] leading-[22px] text-[#111111] transition-all duration-150 ${
                                isActive
                                    ? "bg-white font-bold shadow-md"
                                    : "bg-[#E8E9EE] font-medium"
                            }`}
                        >
                            {tab.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
