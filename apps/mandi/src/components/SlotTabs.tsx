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

    useEffect(() => {
        setActiveTab(0)
    }, [tabs.length])

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
                            className={`shrink-0 cursor-pointer rounded-full border-none px-5 py-2.5 text-[15px] leading-5.5 transition-all duration-150 ${
                                isActive
                                    ? "bg-white font-bold text-[#111111] shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
                                    : "bg-transparent font-medium text-[#6B7280] hover:text-[#111111]"
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
