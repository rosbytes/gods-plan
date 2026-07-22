interface AvatarProps {
    name: string
    avatarUrl?: string
    size?: "sm" | "md" | "lg"
    className?: string
}

export default function Avatar({ name, avatarUrl, size = "md", className = "" }: AvatarProps) {
    const initials = name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()

    let sizeClasses = "h-11 w-11 text-[20px]"
    if (size === "sm") {
        sizeClasses = "h-9 w-9 text-[15px]"
    } else if (size === "lg") {
        sizeClasses = "h-12 w-12 text-[22px]"
    }

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={name}
                className={`${sizeClasses} shrink-0 rounded-full object-cover ${className}`}
            />
        )
    }

    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-full bg-[#F2F3F6] ${sizeClasses} ${className}`}
        >
            <span
                style={{
                    fontFamily: "'Apercu Pro', sans-serif",
                    fontWeight: 700,
                    lineHeight: "1.2",
                    color: "#444444",
                }}
            >
                {initials}
            </span>
        </div>
    )
}
