import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { Badge, Button, EmptyState, SearchIcon, PlusIcon, SpinnerIcon } from "../components/ui"

export default function Dashboard() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState("")

    const { data: vendors, isLoading } = trpc.vendor.listAllVendors.useQuery({
        search: searchQuery ? searchQuery : undefined,
    })

    return (
        <div className="min-h-screen bg-[#F5F6F8] pb-28 font-sans text-gray-900">
            <div className="mx-auto max-w-5xl">
                {/* Top Header & Search Bar */}
                <header className="sticky top-0 z-20 bg-[#F5F6F8]/90 px-5 pt-8 pb-4 backdrop-blur-md md:px-8">
                    <div className="mb-5 flex items-center justify-between">
                        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                            ROS Admin <span className="text-2xl">👋</span>
                        </h1>
                    </div>

                    {/* Search Bar */}
                    <div className="relative rounded-2xl shadow-xs">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                            <SearchIcon size={20} />
                        </div>
                        <input
                            type="text"
                            className="w-full rounded-2xl border border-gray-100 bg-white py-3.5 pr-4 pl-11 text-[15px] font-medium text-gray-800 transition-colors placeholder:text-gray-400 focus:border-[#135B47] focus:outline-none"
                            placeholder="Search by vendor name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </header>

                {/* Quick Management Navigation */}
                <section className="mt-2 px-5 md:px-8">
                    <h2 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                        Management
                    </h2>
                    <div className="grid grid-cols-3 gap-3 sm:max-w-md">
                        <button
                            onClick={() => navigate("/manage/cities")}
                            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs transition-all hover:border-emerald-200 hover:shadow-md active:scale-95"
                        >
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                                🏙️
                            </span>
                            <span className="text-[13px] font-semibold text-gray-700">Cities</span>
                        </button>
                        <button
                            onClick={() => navigate("/manage/mandis")}
                            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs transition-all hover:border-emerald-200 hover:shadow-md active:scale-95"
                        >
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                                🏪
                            </span>
                            <span className="text-[13px] font-semibold text-gray-700">Mandis</span>
                        </button>
                        <button
                            onClick={() => navigate("/manage/vegetables")}
                            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs transition-all hover:border-emerald-200 hover:shadow-md active:scale-95"
                        >
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                                🥬
                            </span>
                            <span className="text-[13px] font-semibold text-gray-700">
                                Vegetables
                            </span>
                        </button>
                    </div>
                </section>

                {/* Vendors List Section */}
                <section className="mt-8 px-5 md:px-8">
                    <h2 className="mb-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                        Recent Registrations
                    </h2>

                    {isLoading ? (
                        <div className="flex justify-center py-12 text-gray-400">
                            <SpinnerIcon size={24} className="text-[#135B47]" />
                        </div>
                    ) : vendors?.items?.length === 0 ? (
                        <EmptyState
                            title="No Vendors Found"
                            description={
                                searchQuery
                                    ? `No vendor matching "${searchQuery}"`
                                    : "Start by registering your first vendor."
                            }
                            action={
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={<PlusIcon size={16} />}
                                    onClick={() => navigate("/create-vendor")}
                                >
                                    Add Vendor
                                </Button>
                            }
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {vendors?.items?.map((vendor) => (
                                <div
                                    key={vendor.id}
                                    onClick={() => navigate(`/vendor/${vendor.id}`)}
                                    className="flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs transition-all hover:shadow-md active:scale-[0.99]"
                                >
                                    {/* Avatar */}
                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-100">
                                        <div
                                            className={`flex h-full w-full items-center justify-center ${
                                                vendor.type === "mandi"
                                                    ? "bg-amber-50"
                                                    : "bg-emerald-50"
                                            }`}
                                        >
                                            <span className="text-lg">
                                                {vendor.type === "mandi" ? "🥬" : "🏪"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-1 flex-col overflow-hidden">
                                        <span className="truncate text-[16px] font-bold tracking-tight text-gray-800">
                                            {vendor.fullName}
                                        </span>
                                        <span className="mt-0.5 text-[13px] font-medium text-gray-400 capitalize">
                                            {vendor.type === "mandi"
                                                ? "Mandi Vendor"
                                                : "Market Vendor"}
                                        </span>
                                    </div>
                                    <Badge
                                        variant={vendor.type === "mandi" ? "warning" : "success"}
                                    >
                                        {vendor.type}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-0 left-0 z-30 w-full bg-linear-to-t from-[#F5F6F8] via-[#F5F6F8]/80 to-transparent px-5 py-6 md:left-1/2 md:max-w-5xl md:-translate-x-1/2 md:px-8">
                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={<PlusIcon size={20} />}
                    onClick={() => navigate("/create-vendor")}
                >
                    Add New Vendor
                </Button>
            </div>
        </div>
    )
}
