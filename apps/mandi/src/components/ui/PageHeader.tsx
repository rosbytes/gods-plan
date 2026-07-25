import { useNavigate } from "react-router-dom"
import { SearchIcon } from "@/components/icons"
import { trpc } from "@/libs/trpc"

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

    const { data: profile } = trpc.vendor.getProfile.useQuery(undefined, {
        retry: false,
        refetchOnWindowFocus: false,
    })

    return (
        <div className="flex h-12 w-full items-center justify-between bg-[#F2F3F6] px-5">
            {leftElement ?? (
                <span className="font-apercu text-[20px] leading-6 font-bold text-[#000000]">
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
                        className="flex h-10.5 w-10.5 shrink-0 cursor-pointer overflow-hidden rounded-full border border-white bg-[#CBD5E1] shadow-sm"
                        onClick={() => navigate("/profile")}
                    >
                        {profile?.avatarUrl ? (
                            <img
                                src={profile.avatarUrl}
                                alt={profile.fullName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="font-apercu flex h-full w-full items-center justify-center text-[13px] font-bold text-[#334155]">
                                {profile?.fullName
                                    ? profile.fullName
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                    : "RO"}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
