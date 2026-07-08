import { useNavigate } from "react-router-dom"
import { SearchIcon } from "@/components/icons"

interface PageHeaderProps {
    title: string
    /** Show the search icon button (default: true) */
    showSearch?: boolean
    /** Show the avatar button (default: true) */
    showAvatar?: boolean
    /** Custom left element (e.g. back button) — replaces the title */
    leftElement?: React.ReactNode
}

export default function PageHeader({
    title,
    showSearch = true,
    showAvatar = true,
    leftElement,
}: PageHeaderProps) {
    const navigate = useNavigate()

    return (
        <div className="flex h-12 w-full items-center justify-between bg-[#F2F3F6] px-5">
            {leftElement ?? (
                <span className="font-apercu text-[20px] leading-[24px] font-bold text-[#000000]">
                    {title}
                </span>
            )}
            <div className="flex items-center gap-3.5">
                {showSearch && (
                    <button
                        type="button"
                        className="flex cursor-pointer items-center justify-center border-none bg-transparent p-1"
                        onClick={() => navigate("/search")}
                    >
                        <SearchIcon />
                    </button>
                )}
                {showAvatar && (
                    <div
                        className="flex h-10.5 w-10.5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#CBD5E1]"
                        onClick={() => navigate("/profile")}
                    >
                        <span className="font-apercu text-[13px] font-bold text-[#334155]">RO</span>
                    </div>
                )}
            </div>
        </div>
    )
}
