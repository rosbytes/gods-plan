import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"

export default function Dashboard() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState("")

    // We will query the vendors list using the backend tRPC route
    // const { data: marketVendors, isMarketLoading } = trpc.vendor.listMarket.useQuery({ search: searchQuery })
    // const { data: mandiVendors, isMandiLoading } = trpc.vendor.listMandi.useQuery({ search: searchQuery })
    const { data: vendors, isLoading } = trpc.vendor.listAllVendors.useQuery({
        search: searchQuery ? searchQuery : undefined,
    })

    return (
        <div className="flex min-h-screen flex-col bg-[#F5F6F8] pb-24 font-sans text-gray-900">
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
                {/* Header & Sticky Top Section */}
                <div className="sticky top-0 z-20 bg-[#F5F6F8] px-5 pt-12 pb-4 md:px-8 md:pt-8">
                    <div className="mb-6 flex items-center gap-1.5 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                        ROS Admin{" "}
                        <span className="mb-1 text-[1.3rem] leading-none md:text-[1.5rem]">👋</span>
                    </div>

                    {/* Search Bar */}
                    <div className="relative rounded-[18px] shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#9ca3af"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="w-full rounded-[18px] bg-white py-3.5 pr-4 pl-11 text-[15px] font-medium text-gray-800 placeholder-gray-400 focus:outline-none md:text-base"
                            placeholder="Search for vendor name or id"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Manage Section */}
                <div className="mt-1 px-5 md:px-8">
                    <p className="mb-3 text-[14px] font-semibold text-gray-500">Manage</p>
                    <div className="grid grid-cols-3 gap-3 md:max-w-xl md:gap-4">
                        <button
                            onClick={() => navigate("/manage/cities")}
                            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md active:bg-gray-50"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F3F0] text-xl">
                                🏙️
                            </span>
                            <span className="text-[13px] font-semibold text-gray-700 md:text-sm">
                                Cities
                            </span>
                        </button>
                        <button
                            onClick={() => navigate("/manage/mandis")}
                            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md active:bg-gray-50"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F3F0] text-xl">
                                🏪
                            </span>
                            <span className="text-[13px] font-semibold text-gray-700 md:text-sm">
                                Mandis
                            </span>
                        </button>
                        <button
                            onClick={() => navigate("/manage/vegetables")}
                            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md active:bg-gray-50"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F3F0] text-xl">
                                🥬
                            </span>
                            <span className="text-[13px] font-semibold text-gray-700 md:text-sm">
                                Vegetables
                            </span>
                        </button>
                    </div>
                </div>

                {/* List Section */}
                <div className="mt-6 flex-1 px-5 md:px-8">
                    <h2 className="mb-4 text-[15px] font-semibold text-gray-600 md:text-base">
                        Recent Registrations
                    </h2>

                    {isLoading ? (
                        <div className="mt-10 flex justify-center text-gray-400">Loading...</div>
                    ) : (
                        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
                            {vendors?.items?.length === 0 ? (
                                <div className="col-span-full mt-10 text-center text-sm text-gray-400">
                                    No vendors found.
                                </div>
                            ) : (
                                vendors?.items?.map((vendor) => (
                                    <div
                                        key={vendor.id}
                                        onClick={() => navigate(`/vendor/${vendor.id}`)}
                                        className="flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-50 bg-white p-4.5 shadow-sm transition-all hover:shadow-md active:bg-gray-50"
                                    >
                                        {/* Avatar */}
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                                            <div
                                                className={`flex h-full w-full items-center justify-center ${vendor.type === "mandi" ? "bg-[#FFF3E0]" : "bg-[#E8F3F0]"}`}
                                            >
                                                <span className="text-lg">
                                                    {vendor.type === "mandi" ? "🥬" : "🏪"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col">
                                            <span className="text-[16px] font-bold tracking-tight text-gray-800">
                                                {vendor.fullName}
                                            </span>
                                            <span className="mt-0.5 text-[13px] font-medium text-gray-400 capitalize">
                                                {vendor.type === "mandi"
                                                    ? "Mandi Vendor"
                                                    : "Market Vendor"}
                                            </span>
                                        </div>
                                        {/* Type badge */}
                                        <span
                                            className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${vendor.type === "mandi" ? "bg-[#FFF3E0] text-[#E65100]" : "bg-[#E8F3F0] text-[#135B47]"}`}
                                        >
                                            {vendor.type}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-0 left-0 z-30 w-full bg-linear-to-t from-[#F5F6F8] via-[#F5F6F8] to-transparent px-5 py-6 md:left-1/2 md:max-w-5xl md:-translate-x-1/2 md:px-8">
                <button
                    onClick={() => navigate("/create-vendor")}
                    className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[18px] bg-[#135B47] py-4.5 text-[16px] font-semibold text-white shadow-md transition-all hover:bg-[#0f4d3c] hover:shadow-lg"
                >
                    <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                    Add New Vendor
                </button>
            </div>
        </div>
    )
}
