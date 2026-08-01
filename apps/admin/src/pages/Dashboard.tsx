import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../lib/trpc"
import type { VendorItem } from "../types"
import { AdminLayout } from "../components/layout"
import {
    Badge,
    Button,
    Modal,
    EmptyState,
    SearchIcon,
    PlusIcon,
    TrashIcon,
    SpinnerIcon,
    BuildingIcon,
    StoreIcon,
    VegIcon,
} from "../components/ui"

export default function Dashboard() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedType, setSelectedType] = useState<"all" | "market" | "mandi">("all")
    const [viewMode, setViewMode] = useState<"table" | "grid">("table")

    // Delete state
    const [deletingVendor, setDeletingVendor] = useState<VendorItem | null>(null)

    const {
        data: vendors,
        isLoading,
        refetch,
    } = trpc.vendor.listAllVendors.useQuery({
        search: searchQuery ? searchQuery : undefined,
    })

    const { data: cities } = trpc.city.list.useQuery({})
    const { data: mandis } = trpc.mandi.list.useQuery({})
    const { data: vegetables } = trpc.veg.list.useQuery({})

    const deleteVendorMutation = trpc.vendor.delete.useMutation({
        onSuccess: () => {
            setDeletingVendor(null)
            refetch()
        },
        onError: (e) => alert(e.message),
    })

    // Filtered items based on selected tab
    const filteredVendors = useMemo(() => {
        if (!vendors?.items) return []
        if (selectedType === "all") return vendors.items
        return vendors.items.filter((v) => v.type === selectedType)
    }, [vendors, selectedType])

    // Metric Summary Numbers
    const totalCount = vendors?.items?.length ?? 0
    const mandiCount = vendors?.items?.filter((v) => v.type === "mandi").length ?? 0
    const marketCount = vendors?.items?.filter((v) => v.type === "market").length ?? 0
    const cityCount = cities?.items?.length ?? 0

    const handleDeleteVendorConfirm = () => {
        if (deletingVendor) {
            deleteVendorMutation.mutate({ id: deletingVendor.id })
        }
    }

    return (
        <>
            {/* Vendor Delete Confirmation Modal */}
            <Modal
                isOpen={Boolean(deletingVendor)}
                onClose={() => setDeletingVendor(null)}
                title="Confirm Vendor Deletion"
                subtitle="Are you sure you want to delete this vendor?"
            >
                <div className="space-y-4">
                    <p className="text-xs font-semibold text-gray-600">
                        This action will permanently delete{" "}
                        <strong className="text-gray-900">{deletingVendor?.fullName}</strong> (
                        {deletingVendor?.type} vendor) and their associated records.
                    </p>
                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" fullWidth onClick={() => setDeletingVendor(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            fullWidth
                            isLoading={deleteVendorMutation.isPending}
                            onClick={handleDeleteVendorConfirm}
                        >
                            Delete Vendor
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ========================================================================= */}
            {/* MOBILE VIEW (< 1024px) — 100% PRESERVED ORIGINAL MOBILE DESIGN            */}
            {/* ========================================================================= */}
            <div className="flex min-h-screen flex-col bg-[#F5F6F8] pb-24 font-sans text-gray-900 lg:hidden">
                <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
                    {/* Header & Sticky Top Section */}
                    <div className="sticky top-0 z-20 bg-[#F5F6F8] px-5 pt-12 pb-4">
                        <div className="mb-6 flex items-center gap-1.5 text-xl font-bold tracking-tight text-gray-900">
                            ROS Admin <span className="mb-1 text-[1.3rem] leading-none">👋</span>
                        </div>

                        {/* Search Bar */}
                        <div className="relative rounded-[18px] shadow-xs">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                <SearchIcon size={20} />
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

                    {/* Manage Section */}
                    <div className="mt-1 px-5">
                        <p className="mb-3 text-[14px] font-semibold text-gray-500">Manage</p>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => navigate("/manage/cities")}
                                className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-xs transition-all hover:shadow-md active:bg-gray-50"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F3F0] text-xl">
                                    🏙️
                                </span>
                                <span className="text-[13px] font-semibold text-gray-700">
                                    Cities
                                </span>
                            </button>
                            <button
                                onClick={() => navigate("/manage/mandis")}
                                className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-xs transition-all hover:shadow-md active:bg-gray-50"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F3F0] text-xl">
                                    🏪
                                </span>
                                <span className="text-[13px] font-semibold text-gray-700">
                                    Mandis
                                </span>
                            </button>
                            <button
                                onClick={() => navigate("/manage/vegetables")}
                                className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-xs transition-all hover:shadow-md active:bg-gray-50"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F3F0] text-xl">
                                    🥬
                                </span>
                                <span className="text-[13px] font-semibold text-gray-700">
                                    Vegetables
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="mt-6 flex-1 px-5">
                        <h2 className="mb-4 text-[15px] font-semibold text-gray-600">
                            Recent Registrations
                        </h2>

                        {isLoading ? (
                            <div className="mt-10 flex justify-center text-gray-400">
                                Loading...
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {vendors?.items?.length === 0 ? (
                                    <div className="mt-10 text-center text-sm text-gray-400">
                                        No vendors found.
                                    </div>
                                ) : (
                                    vendors?.items?.map((vendor) => (
                                        <div
                                            key={vendor.id}
                                            onClick={() => navigate(`/vendor/${vendor.id}`)}
                                            className="flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-50 bg-white p-4.5 shadow-xs transition-all hover:shadow-md active:bg-gray-50"
                                        >
                                            {/* Avatar */}
                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                                                <div
                                                    className={`flex h-full w-full items-center justify-center ${
                                                        vendor.type === "mandi"
                                                            ? "bg-[#FFF3E0]"
                                                            : "bg-[#E8F3F0]"
                                                    }`}
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
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${
                                                        vendor.type === "mandi"
                                                            ? "bg-[#FFF3E0] text-[#E65100]"
                                                            : "bg-[#E8F3F0] text-[#135B47]"
                                                    }`}
                                                >
                                                    {vendor.type}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setDeletingVendor(vendor as VendorItem)
                                                    }}
                                                    className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <TrashIcon size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Action Button */}
                <div className="fixed bottom-0 left-0 z-30 w-full bg-linear-to-t from-[#F5F6F8] via-[#F5F6F8] to-transparent px-5 py-6">
                    <button
                        onClick={() => navigate("/create-vendor")}
                        className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[18px] bg-[#135B47] py-4.5 text-[16px] font-semibold text-white shadow-md transition-all hover:bg-[#0f4d3c] active:scale-[0.98]"
                    >
                        <PlusIcon size={20} />
                        Add New Vendor
                    </button>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* DESKTOP VIEW (>= 1024px) — ELEVATED DESKTOP DASHBOARD                      */}
            {/* ========================================================================= */}
            <div className="hidden lg:block">
                <AdminLayout
                    title="Dashboard Overview"
                    subtitle="Real-time monitoring of onboarded vendors and regional networks"
                >
                    {/* Executive Metric Cards Grid */}
                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Total Vendors Card */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Total Vendors
                                </span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#135B47]">
                                    <StoreIcon size={20} />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-2xl font-black tracking-tight text-gray-900">
                                    {totalCount}
                                </span>
                                <span className="text-xs font-medium text-emerald-600">
                                    Onboarded
                                </span>
                            </div>
                        </div>

                        {/* Mandi Vendors Card */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Mandi Vendors
                                </span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    <VegIcon size={20} />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-2xl font-black tracking-tight text-gray-900">
                                    {mandiCount}
                                </span>
                                <span className="text-xs font-medium text-amber-600">
                                    Wholesale
                                </span>
                            </div>
                        </div>

                        {/* Market Vendors Card */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Market Vendors
                                </span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <StoreIcon size={20} />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-2xl font-black tracking-tight text-gray-900">
                                    {marketCount}
                                </span>
                                <span className="text-xs font-medium text-blue-600">Retail</span>
                            </div>
                        </div>

                        {/* Active Regions Card */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Active Cities
                                </span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                    <BuildingIcon size={20} />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-2xl font-black tracking-tight text-gray-900">
                                    {cityCount}
                                </span>
                                <span className="text-xs font-medium text-purple-600">
                                    Locations
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Management Banner */}
                    <div className="mb-8 rounded-2xl border border-emerald-100 bg-linear-to-r from-[#0F382C] to-[#135B47] p-6 text-white shadow-md">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <div>
                                <h2 className="text-lg font-bold">Manage Platform Resources</h2>
                                <p className="mt-1 max-w-xl text-xs text-emerald-200/90">
                                    Easily manage cities, mandis, and fresh produce catalogs across
                                    all operational zones.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => navigate("/manage/cities")}
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-xs transition-colors hover:bg-white/20"
                                >
                                    🏙️ Cities ({cityCount})
                                </button>
                                <button
                                    onClick={() => navigate("/manage/mandis")}
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-xs transition-colors hover:bg-white/20"
                                >
                                    🏪 Mandis ({mandis?.items?.length ?? 0})
                                </button>
                                <button
                                    onClick={() => navigate("/manage/vegetables")}
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-xs transition-colors hover:bg-white/20"
                                >
                                    🥬 Catalog ({vegetables?.items?.length ?? 0})
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Vendors Table / List Section */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                        {/* Header & Controls Bar */}
                        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                            <div>
                                <h2 className="text-base font-bold text-gray-800">
                                    Recent Vendors
                                </h2>
                                <p className="mt-0.5 text-xs font-medium text-gray-400">
                                    Showing registered vendors and profiles
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Search Input */}
                                <div className="relative min-w-60 flex-1 sm:flex-initial">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <SearchIcon size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pr-3 pl-9 text-xs font-medium text-gray-800 transition-colors placeholder:text-gray-400 focus:border-[#135B47] focus:bg-white focus:outline-none"
                                        placeholder="Search by name or ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* Filter Tabs */}
                                <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1 text-xs font-semibold text-gray-600">
                                    <button
                                        onClick={() => setSelectedType("all")}
                                        className={`cursor-pointer rounded-lg px-3 py-1.5 transition-colors ${
                                            selectedType === "all"
                                                ? "bg-white text-[#135B47] shadow-xs"
                                                : "hover:text-gray-900"
                                        }`}
                                    >
                                        All ({totalCount})
                                    </button>
                                    <button
                                        onClick={() => setSelectedType("market")}
                                        className={`cursor-pointer rounded-lg px-3 py-1.5 transition-colors ${
                                            selectedType === "market"
                                                ? "bg-white text-[#135B47] shadow-xs"
                                                : "hover:text-gray-900"
                                        }`}
                                    >
                                        Market ({marketCount})
                                    </button>
                                    <button
                                        onClick={() => setSelectedType("mandi")}
                                        className={`cursor-pointer rounded-lg px-3 py-1.5 transition-colors ${
                                            selectedType === "mandi"
                                                ? "bg-white text-[#135B47] shadow-xs"
                                                : "hover:text-gray-900"
                                        }`}
                                    >
                                        Mandi ({mandiCount})
                                    </button>
                                </div>

                                {/* View Switcher */}
                                <div className="hidden rounded-xl border border-gray-200 bg-gray-50 p-1 text-xs font-semibold text-gray-600 sm:flex">
                                    <button
                                        onClick={() => setViewMode("table")}
                                        className={`cursor-pointer rounded-lg px-2.5 py-1.5 transition-colors ${
                                            viewMode === "table"
                                                ? "bg-white text-[#135B47] shadow-xs"
                                                : "hover:text-gray-900"
                                        }`}
                                        title="Table View"
                                    >
                                        📊 Table
                                    </button>
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`cursor-pointer rounded-lg px-2.5 py-1.5 transition-colors ${
                                            viewMode === "grid"
                                                ? "bg-white text-[#135B47] shadow-xs"
                                                : "hover:text-gray-900"
                                        }`}
                                        title="Card View"
                                    >
                                        🎴 Cards
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content Data Table / Grid */}
                        {isLoading ? (
                            <div className="flex justify-center py-16 text-gray-400">
                                <SpinnerIcon size={28} className="text-[#135B47]" />
                            </div>
                        ) : filteredVendors.length === 0 ? (
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
                        ) : viewMode === "table" ? (
                            /* Desktop Data Table */
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="w-full text-left text-xs font-medium text-gray-600">
                                    <thead className="border-b border-gray-100 bg-gray-50/80 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                                        <tr>
                                            <th className="px-4 py-3.5">Vendor Name</th>
                                            <th className="px-4 py-3.5">Vendor Type</th>
                                            <th className="px-4 py-3.5">Primary Contact</th>
                                            <th className="px-4 py-3.5">Vendor ID</th>
                                            <th className="px-4 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {filteredVendors.map((v) => (
                                            <tr
                                                key={v.id}
                                                onClick={() => navigate(`/vendor/${v.id}`)}
                                                className="group cursor-pointer transition-colors hover:bg-emerald-50/30"
                                            >
                                                <td className="px-4 py-3.5 font-bold text-gray-800">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${
                                                                v.type === "mandi"
                                                                    ? "bg-amber-50 text-amber-700"
                                                                    : "bg-emerald-50 text-emerald-700"
                                                            }`}
                                                        >
                                                            {v.type === "mandi" ? "🥬" : "🏪"}
                                                        </div>
                                                        <span className="transition-colors group-hover:text-[#135B47]">
                                                            {v.fullName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <Badge
                                                        variant={
                                                            v.type === "mandi"
                                                                ? "warning"
                                                                : "success"
                                                        }
                                                    >
                                                        {v.type}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3.5 font-semibold text-gray-600">
                                                    {v.primaryPhone || "N/A"}
                                                </td>
                                                <td className="px-4 py-3.5 font-mono text-[11px] text-gray-400">
                                                    {v.id.substring(0, 12)}...
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                navigate(`/vendor/${v.id}`)
                                                            }}
                                                        >
                                                            View Profile →
                                                        </Button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setDeletingVendor(v as VendorItem)
                                                            }}
                                                            className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                            title="Delete vendor"
                                                        >
                                                            <TrashIcon size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* Visual Card Grid */
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredVendors.map((vendor) => (
                                    <div
                                        key={vendor.id}
                                        onClick={() => navigate(`/vendor/${vendor.id}`)}
                                        className="flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs transition-all hover:shadow-md active:scale-[0.99]"
                                    >
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
                                            <span className="truncate text-[15px] font-bold tracking-tight text-gray-800">
                                                {vendor.fullName}
                                            </span>
                                            <span className="mt-0.5 text-xs font-medium text-gray-400 capitalize">
                                                {vendor.type === "mandi"
                                                    ? "Mandi Vendor"
                                                    : "Market Vendor"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={
                                                    vendor.type === "mandi" ? "warning" : "success"
                                                }
                                            >
                                                {vendor.type}
                                            </Badge>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setDeletingVendor(vendor as VendorItem)
                                                }}
                                                className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                title="Delete vendor"
                                            >
                                                <TrashIcon size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </AdminLayout>
            </div>
        </>
    )
}
