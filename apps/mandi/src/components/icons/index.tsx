// ─── Shared SVG Icon Components ─────────────────────────────────────
// Extracted from Pages that were duplicating these icons

export function SearchIcon({ size = 22, color = "#444444" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
            <path d="M17 17L21 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
    )
}

export function CalendarIcon({ size = 28, color = "#444444" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.8" />
            <path
                d="M16 2V6M8 2V6M3 10H21"
                stroke={color}
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    )
}

export function BackArrowIcon() {
    return (
        <svg
            width="23"
            height="21"
            viewBox="0 0 23 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M9.62579 20.3725C9.81684 20.5528 10.0698 20.653 10.3325 20.6525C10.5942 20.6547 10.8452 20.5485 11.0258 20.3591C11.2164 20.1734 11.3239 19.9186 11.3239 19.6525C11.3239 19.3863 11.2164 19.1315 11.0258 18.9458L3.4257 11.3457H21.0527C21.605 11.3457 22.0527 10.898 22.0527 10.3457C22.0527 9.79342 21.605 9.3457 21.0527 9.3457H3.42278L11.0391 1.70579C11.2297 1.52007 11.3372 1.26524 11.3372 0.99912C11.3372 0.733003 11.2297 0.47817 11.0391 0.292453C10.6487 -0.0974845 10.0162 -0.0974845 9.62579 0.292453L0.292453 9.62579C-0.0974845 10.0162 -0.0974845 10.6487 0.292453 11.0391L9.62579 20.3725Z"
                fill="black"
            />
        </svg>
    )
}

export function RefreshIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M8.99999 18C6.48749 18 4.35937 17.1281 2.61562 15.3844C0.871874 13.6406 0 11.5125 0 9C0 6.4875 0.871874 4.35938 2.61562 2.61563C4.35937 0.871878 6.48749 3.87931e-06 8.99999 3.87931e-06C10.2937 3.87931e-06 11.5312 0.267004 12.7125 0.801004C13.8937 1.335 14.9062 2.09925 15.75 3.09375V1.125C15.75 0.806254 15.858 0.539254 16.074 0.324004C16.29 0.108754 16.557 0.000753879 16.875 3.87931e-06C17.193 -0.000746121 17.4604 0.107254 17.6771 0.324004C17.8939 0.540754 18.0015 0.807754 18 1.125V6.75C18 7.06875 17.892 7.33613 17.676 7.55213C17.46 7.76813 17.193 7.87575 16.875 7.875H11.25C10.9312 7.875 10.6642 7.767 10.449 7.551C10.2337 7.335 10.1257 7.068 10.125 6.75C10.1242 6.432 10.2322 6.165 10.449 5.949C10.6657 5.733 10.9327 5.625 11.25 5.625H14.85C14.25 4.575 13.4299 3.75 12.3896 3.15C11.3494 2.55 10.2195 2.25 8.99999 2.25C7.12499 2.25 5.53125 2.90625 4.21875 4.21875C2.90625 5.53125 2.25 7.125 2.25 9C2.25 10.875 2.90625 12.4688 4.21875 13.7813C5.53125 15.0938 7.12499 15.75 8.99999 15.75C10.275 15.75 11.4424 15.4268 12.5021 14.7803C13.5619 14.1338 14.382 13.2664 14.9625 12.1781C15.1125 11.9156 15.3236 11.733 15.5959 11.6303C15.8681 11.5275 16.1445 11.5226 16.425 11.6156C16.725 11.7094 16.9406 11.9063 17.0719 12.2063C17.2031 12.5063 17.1937 12.7875 17.0437 13.05C16.275 14.55 15.1781 15.75 13.7531 16.65C12.3281 17.55 10.7437 18 8.99999 18Z"
                fill="#444444"
            />
        </svg>
    )
}

export function CheckIcon() {
    return (
        <svg width="11.25" height="11.25" viewBox="0 0 24 24" fill="none">
            <path
                d="M5 12L10 17L20 7"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export function SpinnerIcon({
    size = 20,
    className = "",
    ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`animate-spin ${className}`}
            {...props}
        >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="0.75" />
        </svg>
    )
}
