import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"

export default function Dashboard() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState("")

    // We will query the vendors list using the backend tRPC route
    const { data: vendors, isLoading } = trpc.vendor.list.useQuery({ search: searchQuery })

    return (
        <div className="flex min-h-screen flex-col bg-[#F5F6F8] pb-24 font-sans text-gray-900">
            {/* Header & Sticky Top Section */}
            <div className="sticky top-0 z-20 bg-[#F5F6F8] px-5 pt-12 pb-4">
                <div className="mb-6 flex items-center gap-1.5 text-xl font-bold tracking-tight text-gray-900">
                    ROS Admin <span className="mb-1 text-[1.3rem] leading-none">👋</span>
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
                        className="w-full rounded-[18px] bg-white py-3.5 pr-4 pl-11 text-[15px] font-medium text-gray-800 placeholder-gray-400 focus:outline-none"
                        placeholder="Search for vendor name or id"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List Section */}
            <div className="mt-2 flex-1 px-5">
                <h2 className="mb-4 text-[15px] font-semibold text-gray-600">
                    Recent Registrations
                </h2>

                {isLoading ? (
                    <div className="mt-10 flex justify-center text-gray-400">Loading...</div>
                ) : (
                    <div className="space-y-3">
                        {vendors?.items?.length === 0 ? (
                            <div className="mt-10 text-center text-sm text-gray-400">
                                No vendors found.
                            </div>
                        ) : (
                            vendors?.items?.map((vendor: any) => (
                                <div
                                    key={vendor.id}
                                    onClick={() => navigate(`/vendor/${vendor.id}`)}
                                    className="flex cursor-pointer items-center gap-4 rounded-[16px] border border-gray-50 bg-white p-[18px] shadow-sm transition-colors active:bg-gray-50"
                                >
                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                                        {vendor.kycDocs?.[0]?.storefrontUrl ? (
                                            <img
                                                src={vendor.kycDocs[0].storefrontUrl}
                                                alt="Storefront avatar"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="#9ca3af"
                                                    strokeWidth="2"
                                                >
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <path d="M12 8v4l3 3"></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[16px] font-bold tracking-tight text-gray-800">
                                            {vendor.stores?.[0]?.storeName || vendor.fullName}
                                        </span>
                                        <span className="mt-0.5 text-[14px] font-medium text-gray-400 capitalize">
                                            {vendor.type.replace("_", " ")}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-0 left-0 z-30 w-full bg-linear-to-t from-[#F5F6F8] via-[#F5F6F8] to-transparent px-5 py-6">
                <button
                    onClick={() => navigate("/create-vendor")}
                    className="flex w-full items-center justify-center gap-3 rounded-[18px] bg-[#135B47] py-[18px] text-[16px] font-semibold text-white shadow-md transition-colors hover:bg-[#0f4d3c]"
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
