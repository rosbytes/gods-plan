import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { trpc } from "../lib/trpc"
import { toast } from "sonner"
import { Button, Input, Modal } from "../components/ui"
import { PhoneInput } from "@ros/ui"
import { generateAndDownloadAgreementPdf } from "../lib/agreementPdf"

type KycDoc = {
    storefrontUrl?: string
    docId?: string
    frontUrl?: string
    backUrl?: string
}

// ──────────────────────────────────────────────────────────────────────────────
// Toggle Switch Component
// ──────────────────────────────────────────────────────────────────────────────
function ToggleSwitch({
    checked,
    onChange,
    disabled,
    id,
}: {
    checked: boolean
    onChange: (val: boolean) => void
    disabled?: boolean
    id: string
}) {
    return (
        <button
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                checked ? "bg-[#135B47]" : "bg-gray-200"
            }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                    checked ? "translate-x-5" : "translate-x-0.5"
                }`}
            />
        </button>
    )
}

// ──────────────────────────────────────────────────────────────────────────────
// Status Row Component
// ──────────────────────────────────────────────────────────────────────────────
function StatusRow({
    label,
    description,
    checked,
    onChange,
    isLoading,
    id,
}: {
    label: string
    description: string
    checked: boolean
    onChange: (val: boolean) => void
    isLoading?: boolean
    id: string
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-gray-800">{label}</span>
                <span className="text-[12px] font-medium text-gray-400">{description}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${
                        checked ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}
                >
                    {checked ? "Yes" : "No"}
                </span>
                {isLoading ? (
                    <div className="h-6 w-11 animate-pulse rounded-full bg-gray-200" />
                ) : (
                    <ToggleSwitch id={id} checked={checked} onChange={onChange} />
                )}
            </div>
        </div>
    )
}

export default function VendorProfile() {
    const navigate = useNavigate()
    const { vendorId } = useParams<{ vendorId: string }>()

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        primaryPhone: "",
        alternatePhone: "",
        storeName: "",
        fullAddress: "",
    })

    const { data, isLoading, error, refetch } = trpc.vendor.getById.useQuery(
        { vendorId: vendorId! },
        { enabled: !!vendorId },
    )

    const updateMutation = trpc.vendor.update.useMutation({
        onSuccess: () => {
            toast.success("Vendor profile updated successfully")
            setIsEditModalOpen(false)
            refetch()
        },
        onError: (err) => {
            toast.error(err.message || "Failed to update vendor profile")
        },
    })

    const toggleVendorMutation = trpc.vendor.toggleStatus.useMutation({
        onSuccess: (_, variables) => {
            const label =
                variables.field === "isApproved"
                    ? variables.value
                        ? "Vendor approved"
                        : "Vendor approval revoked"
                    : variables.value
                      ? "Vendor activated"
                      : "Vendor deactivated"
            toast.success(label)
            refetch()
        },
        onError: (err) => toast.error(err.message || "Failed to update vendor status"),
    })

    const toggleStoreMutation = trpc.store.toggleStatus.useMutation({
        onSuccess: (_, variables) => {
            const label =
                variables.field === "isApproved"
                    ? variables.value
                        ? "Store approved"
                        : "Store approval revoked"
                    : variables.value
                      ? "Store activated"
                      : "Store deactivated"
            toast.success(label)
            refetch()
        },
        onError: (err) => toast.error(err.message || "Failed to update store status"),
    })

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F6F8]">
                <span className="font-medium text-gray-400">Loading profile...</span>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F5F6F8] p-4 text-center">
                <span className="font-medium text-red-500">
                    {error?.message || "Could not load profile."}
                </span>
                <button
                    onClick={() => navigate(-1)}
                    className="cursor-pointer rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                >
                    Go Back
                </button>
            </div>
        )
    }

    const { vendor, charge, type } = data
    const vendorAny = vendor as any
    const store = vendorAny.marketStores?.[0] ?? vendorAny.mandiStores?.[0]
    const kyc: KycDoc | null = vendorAny.kycDocs?.[0] ?? null
    const agreement = store?.agreement ?? null
    const vendorIsApproved: boolean = vendorAny.isApproved ?? false

    const handleOpenEdit = () => {
        setFormData({
            fullName: vendor.fullName || "",
            primaryPhone: vendor.primaryPhone || "",
            alternatePhone: vendor.alternatePhone || "",
            storeName: store?.storeName || "",
            fullAddress: store?.fullAddress || "",
        })
        setIsEditModalOpen(true)
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        if (!vendorId) return
        updateMutation.mutate({
            vendorId,
            fullName: formData.fullName,
            primaryPhone: formData.primaryPhone,
            alternatePhone: formData.alternatePhone || null,
            storeName: formData.storeName,
            fullAddress: formData.fullAddress,
        })
    }

    const shortId = vendorId?.substring(0, 4).toUpperCase() || "0000"

    const formatDate = (dateString?: string | Date) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
    }

    // ──── Toggle helpers ────────────────────────────────────────────────────
    const handleVendorToggle = (field: "isApproved", value: boolean) => {
        if (!vendorId) return
        toggleVendorMutation.mutate({ vendorId, type, field, value })
    }

    const handleStoreToggle = (field: "isActive" | "isApproved", value: boolean) => {
        if (!store?.id) return
        toggleStoreMutation.mutate({
            storeId: store.id,
            type,
            field,
            value,
        })
    }

    const isVendorToggling = toggleVendorMutation.isPending
    const isStoreToggling = toggleStoreMutation.isPending

    return (
        <div className="flex min-h-screen flex-col bg-[#F5F6F8] pb-10 font-sans text-gray-900">
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
                {/* Header */}
                <div className="sticky top-0 z-20 flex items-center justify-between bg-[#F5F6F8] px-5 pt-12 pb-4 md:px-8 md:pt-8">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="mr-3 cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-200"
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                        <h1 className="text-[18px] font-bold tracking-tight md:text-xl">
                            ROS ID: {type === "mandi" ? "M" : "V"}
                            {shortId}
                        </h1>
                    </div>
                    <button
                        onClick={handleOpenEdit}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#135B47] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#0f4737]"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit Profile
                    </button>
                </div>

                <div className="space-y-6 px-5 md:px-8">
                    {/* Top Card */}
                    <div className="flex items-center gap-4 rounded-2xl bg-white p-4.5 shadow-sm">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                {type === "mandi" ? (
                                    <span className="text-2xl">🥬</span>
                                ) : (
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#9ca3af"
                                        strokeWidth="2"
                                    >
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M12 8v4l3 3"></path>
                                    </svg>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col">
                            <span className="text-[17px] font-bold tracking-tight text-gray-900 md:text-lg">
                                {store?.storeName || vendor.fullName}
                            </span>
                            <span className="text-[14px] font-medium text-gray-400 capitalize">
                                {type === "mandi" ? "Mandi Vendor" : "Market Vendor"}
                            </span>
                        </div>
                        {/* Quick status badges */}
                        <div className="flex flex-col items-end gap-1.5">
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                                    vendorIsApproved
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-amber-50 text-amber-700"
                                }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${vendorIsApproved ? "bg-emerald-500" : "bg-amber-500"}`}
                                />
                                {vendorIsApproved ? "Approved" : "Pending"}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
                        {/* Basic Details */}
                        <div className="space-y-3">
                            <h2 className="text-[15px] font-bold text-gray-600">Basic Details</h2>
                            <div className="space-y-5 rounded-2xl bg-white p-5 shadow-sm">
                                <div>
                                    <p className="mb-1 text-[12px] font-semibold text-gray-400">
                                        Full Name
                                    </p>
                                    <p className="text-[15px] font-bold text-gray-800">
                                        {vendor.fullName}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-[12px] font-semibold text-gray-400">
                                        Mobile Number
                                    </p>
                                    <p className="text-[15px] font-bold text-gray-800">
                                        {vendor.primaryPhone}
                                    </p>
                                </div>
                                {vendor.alternatePhone && (
                                    <div>
                                        <p className="mb-1 text-[12px] font-semibold text-gray-400">
                                            Alternate Number
                                        </p>
                                        <p className="text-[15px] font-bold text-gray-800">
                                            {vendor.alternatePhone}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Store Details */}
                        <div className="space-y-3">
                            <h2 className="text-[15px] font-bold text-gray-600">Store Details</h2>
                            <div className="space-y-5 rounded-2xl bg-white p-5 shadow-sm">
                                <div>
                                    <p className="mb-1 text-[12px] font-semibold text-gray-400">
                                        Store Name
                                    </p>
                                    <p className="text-[15px] font-bold text-gray-800">
                                        {store?.storeName || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-[12px] font-semibold text-gray-400">
                                        Full Address
                                    </p>
                                    <p className="text-[15px] leading-snug font-bold text-gray-800">
                                        {store?.fullAddress || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── Vendor Approval ──────────────────────────── */}
                        <div className="space-y-3">
                            <h2 className="text-[15px] font-bold text-gray-600">Vendor Approval</h2>
                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <StatusRow
                                    id="vendor-approved-toggle"
                                    label="Approved"
                                    description="Admin has reviewed and approved this vendor"
                                    checked={vendorIsApproved}
                                    isLoading={isVendorToggling}
                                    onChange={(val) => handleVendorToggle("isApproved", val)}
                                />
                            </div>
                        </div>

                        {/* ── Store Status & Approval ───────────────────────────── */}
                        {store && (
                            <div className="space-y-3">
                                <h2 className="text-[15px] font-bold text-gray-600">
                                    Store Status & Approval
                                </h2>
                                <div className="divide-y divide-gray-100 rounded-2xl bg-white p-5 shadow-sm">
                                    <StatusRow
                                        id="store-approved-toggle"
                                        label="Approved"
                                        description="Admin has approved this store's application"
                                        checked={Boolean(store.isApproved)}
                                        isLoading={isStoreToggling}
                                        onChange={(val) => handleStoreToggle("isApproved", val)}
                                    />
                                    <StatusRow
                                        id="store-active-toggle"
                                        label="Active"
                                        description="Store is visible and accepts orders"
                                        checked={Boolean(store.isActive)}
                                        isLoading={isStoreToggling}
                                        onChange={(val) => handleStoreToggle("isActive", val)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Store Photo */}
                        <div className="space-y-3">
                            <h2 className="text-[15px] font-bold text-gray-600">Store Photo</h2>
                            <div className="relative aspect-21/9 w-full overflow-hidden rounded-2xl bg-gray-200 md:aspect-video">
                                {kyc?.storefrontUrl ? (
                                    <>
                                        <img
                                            src={kyc.storefrontUrl}
                                            alt="Store Photo"
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <div className="rounded-xl bg-white/90 p-2.5 shadow-lg backdrop-blur-sm">
                                                <svg
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="#6b7280"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                                    <circle cx="12" cy="13" r="4"></circle>
                                                </svg>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm font-semibold text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Credentials */}
                        <div className="space-y-3">
                            <h2 className="text-[15px] font-bold text-gray-600">Credentials</h2>
                            <div className="space-y-5 rounded-2xl bg-white p-5 shadow-sm">
                                <div>
                                    <p className="mb-1 text-[12px] font-semibold text-gray-400">
                                        Aadhar Number
                                    </p>
                                    <p className="text-[15px] font-bold tracking-wide text-gray-800">
                                        {kyc?.docId || "N/A"}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="relative aspect-3/2 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                        {kyc?.frontUrl ? (
                                            <>
                                                <img
                                                    src={kyc.frontUrl}
                                                    alt="Front ID"
                                                    className="h-full w-full object-cover"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                    <div className="rounded-lg bg-white/80 p-2 backdrop-blur-sm">
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
                                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                                            <circle cx="12" cy="13" r="4"></circle>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-400">
                                                Front
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative aspect-3/2 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                        {kyc?.backUrl ? (
                                            <>
                                                <img
                                                    src={kyc.backUrl}
                                                    alt="Back ID"
                                                    className="h-full w-full object-cover"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                    <div className="rounded-lg bg-white/80 p-2 backdrop-blur-sm">
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
                                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                                            <circle cx="12" cy="13" r="4"></circle>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-400">
                                                Back
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="col-span-full space-y-3 pb-6">
                            <h2 className="text-[15px] font-bold text-gray-600">Payment Details</h2>
                            <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-[13px] font-medium text-gray-600">
                                        To:{" "}
                                        <span className="font-semibold text-gray-800">ROS@ybl</span>
                                    </span>
                                    <span className="text-[13px] font-medium text-gray-600">
                                        From:{" "}
                                        <span className="font-semibold text-gray-800">
                                            {vendor.primaryPhone.replace("+91", "")}@UPI
                                        </span>
                                    </span>
                                </div>

                                <div className="-mx-2 flex items-center justify-between rounded bg-gray-50 px-2 py-1">
                                    <span className="text-[13px] font-medium text-gray-600">
                                        Transaction ID:{" "}
                                        <span className="ml-1 font-semibold text-gray-800">
                                            {charge?.gatewayPaymentId || "N/A"}
                                        </span>
                                    </span>
                                    {charge?.gatewayPaymentId && (
                                        <button className="cursor-pointer p-1 text-gray-400 hover:text-gray-600">
                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <rect
                                                    x="9"
                                                    y="9"
                                                    width="13"
                                                    height="13"
                                                    rx="2"
                                                    ry="2"
                                                ></rect>
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-[13px] font-medium text-gray-600">
                                        Payment Method:{" "}
                                        <span className="font-semibold text-gray-800 uppercase">
                                            {charge?.paymentMethod?.replace("_", " ") || "UPI QR"}
                                        </span>
                                    </span>
                                    <span className="text-[13px] font-medium text-gray-600">
                                        Date:{" "}
                                        <span className="font-semibold text-gray-800">
                                            {formatDate(charge?.paymentDate)}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── Store Agreement & Digital Verification ───────────────────────────── */}
                        {store && (
                            <div className="col-span-full space-y-3 pb-2">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-[15px] font-bold text-gray-600">
                                        Store Agreement
                                    </h2>
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase ${
                                            agreement
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-amber-50 text-amber-700"
                                        }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                agreement ? "bg-emerald-500" : "bg-amber-500"
                                            }`}
                                        />
                                        {agreement ? "Signed & Verified" : "Pending Agreement"}
                                    </span>
                                </div>

                                <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
                                    {agreement ? (
                                        <>
                                            <div className="flex flex-col gap-1 border-b border-gray-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-[14px] font-bold text-gray-800">
                                                        {agreement.title ||
                                                            "Vendor Service Agreement"}
                                                    </p>
                                                    <p className="text-[12px] text-gray-400">
                                                        Version {agreement.version || "1.0"} •
                                                        Standard Non-Disclosure & Intent Terms
                                                    </p>
                                                </div>
                                                <span className="self-start rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600 sm:self-auto">
                                                    Digital OTP Verified
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                <div>
                                                    <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                                                        Signatory Name
                                                    </p>
                                                    <p className="text-[13px] font-bold text-gray-800">
                                                        {agreement.signerName}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                                                        Verified Phone
                                                    </p>
                                                    <p className="text-[13px] font-bold text-gray-800">
                                                        {agreement.signerPhone}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                                                        Signed Date & Time
                                                    </p>
                                                    <p className="text-[13px] font-bold text-gray-800">
                                                        {formatDate(agreement.signedAt)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                                                        Verification Method
                                                    </p>
                                                    <p className="text-[13px] font-bold text-gray-800">
                                                        {agreement.verificationMethod?.toUpperCase()}{" "}
                                                        (
                                                        {agreement.verificationIdentifier ||
                                                            agreement.signerPhone}
                                                        )
                                                    </p>
                                                </div>
                                                {agreement.signedByAdmin && (
                                                    <div className="col-span-full">
                                                        <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                                                            Supervised / Recorded By Admin
                                                        </p>
                                                        <p className="text-[13px] font-medium text-gray-700">
                                                            {agreement.signedByAdmin.name} (
                                                            {agreement.signedByAdmin.email})
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAgreementModalOpen(true)}
                                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gray-100 px-3.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                                                >
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                        <circle cx="12" cy="12" r="3"></circle>
                                                    </svg>
                                                    View Agreement
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        generateAndDownloadAgreementPdf({
                                                            name:
                                                                agreement.signerName ||
                                                                vendor.fullName,
                                                            phone:
                                                                agreement.signerPhone ||
                                                                vendor.primaryPhone,
                                                            storeId: store.id,
                                                            date: formatDate(agreement.signedAt),
                                                            verificationMethod:
                                                                agreement.verificationMethod,
                                                            verificationIdentifier:
                                                                agreement.verificationIdentifier,
                                                        })
                                                    }
                                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#135B47] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#0f4737]"
                                                >
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                        <polyline points="7 10 12 15 17 10"></polyline>
                                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                                    </svg>
                                                    Download PDF
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-start justify-between gap-3 py-2 sm:flex-row sm:items-center">
                                            <div>
                                                <p className="text-[14px] font-semibold text-gray-800">
                                                    No Agreement Recorded
                                                </p>
                                                <p className="text-[12px] text-gray-500">
                                                    The vendor has not yet completed the digital OTP
                                                    agreement verification for this store.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/agreement/${vendorId}/${store.id}?type=${
                                                            type === "mandi"
                                                                ? "mandi_vendor"
                                                                : "market_vendor"
                                                        }`,
                                                    )
                                                }
                                                className="shrink-0 cursor-pointer rounded-xl bg-[#135B47] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0f4737]"
                                            >
                                                Sign Agreement
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Vendor Profile Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Vendor Profile"
                subtitle={`Update details for ${vendor.fullName}`}
            >
                <form onSubmit={handleSave} className="space-y-4 pt-2">
                    <Input
                        label="Full Name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                    />
                    <PhoneInput
                        label="Mobile Number (Primary) *"
                        value={formData.primaryPhone}
                        onChange={(val, meta) =>
                            setFormData({ ...formData, primaryPhone: meta.e164 || val })
                        }
                        defaultCountry="IN"
                    />
                    <PhoneInput
                        label="Alternate Mobile Number"
                        value={formData.alternatePhone}
                        onChange={(val, meta) =>
                            setFormData({ ...formData, alternatePhone: meta.e164 || val })
                        }
                        defaultCountry="IN"
                        placeholder="Optional"
                    />
                    {store && (
                        <>
                            <Input
                                label="Store Name"
                                value={formData.storeName}
                                onChange={(e) =>
                                    setFormData({ ...formData, storeName: e.target.value })
                                }
                            />
                            <Input
                                label="Full Address"
                                value={formData.fullAddress}
                                onChange={(e) =>
                                    setFormData({ ...formData, fullAddress: e.target.value })
                                }
                            />
                        </>
                    )}
                    <div className="flex gap-3 pt-3">
                        <Button
                            type="button"
                            variant="outline"
                            fullWidth
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            isLoading={updateMutation.isPending}
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* View Signed Agreement Modal */}
            <Modal
                isOpen={isAgreementModalOpen}
                onClose={() => setIsAgreementModalOpen(false)}
                title="Signed Vendor Agreement"
                subtitle={agreement?.title || "Pre-Collaboration Intent & NDA Agreement"}
                maxWidth="lg"
            >
                <div className="space-y-4 pt-2">
                    <div className="max-h-[60vh] space-y-3 overflow-y-auto rounded-xl bg-gray-50 p-4 text-[13px] leading-relaxed text-gray-700">
                        <h4 className="text-center font-bold text-gray-900">
                            NON-DISCLOSURE & PRE-COLLABORATION INTENT AGREEMENT
                        </h4>
                        <p className="text-center text-xs text-gray-500">
                            Signed on {agreement ? formatDate(agreement.signedAt) : "N/A"}
                        </p>

                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                            <p className="font-bold text-gray-900">Between:</p>
                            <p className="mt-1 font-semibold text-gray-800">
                                Oneprovisiongrowth Pvt Ltd (Republic of Sabjiwala)
                            </p>
                            <p className="text-xs text-gray-500">
                                PAN: AAECO7051N | CIN: U46301RJ2025PTC102143
                            </p>
                            <p className="mt-2 font-semibold text-gray-800">AND</p>
                            <p className="mt-1 font-semibold text-gray-800">
                                {agreement?.signerName || vendor.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                                Store: {store?.storeName || `Store_${store?.id?.substring(0, 8)}`} |
                                Phone: {agreement?.signerPhone || vendor.primaryPhone}
                            </p>
                        </div>

                        <p className="font-bold text-gray-900">1. Purpose</p>
                        <p>
                            The Company has shared its business model, operational plan, and
                            collaboration structure with the Vendor. This Agreement protects
                            confidentiality and records mutual intent.
                        </p>

                        <p className="font-bold text-gray-900">2. Confidentiality</p>
                        <p>
                            The Vendor agrees that all information shared by the Company shall be
                            treated as strictly confidential and not disclosed to third parties.
                        </p>

                        <p className="font-bold text-gray-900">
                            3. Expression of Intent & Good Faith
                        </p>
                        <p>
                            Both parties agree to proceed in good faith towards formal commercial
                            execution without competing or misusing disclosed materials.
                        </p>

                        <p className="font-bold text-gray-900">
                            4. Digital Signature & Verification Certificate
                        </p>
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
                            <p className="text-xs font-semibold text-emerald-800">
                                Digitally Accepted & Verified
                            </p>
                            <p className="mt-1 text-xs">
                                Signatory:{" "}
                                <span className="font-semibold">{agreement?.signerName}</span> (
                                {agreement?.signerPhone})
                            </p>
                            <p className="text-xs">
                                Verification Method: {agreement?.verificationMethod?.toUpperCase()}{" "}
                                Verification ({agreement?.verificationIdentifier})
                            </p>
                            <p className="text-xs">
                                Timestamp: {agreement ? formatDate(agreement.signedAt) : "N/A"}
                            </p>
                            {agreement?.signedByAdmin && (
                                <p className="text-xs">
                                    Supervised By: {agreement.signedByAdmin.name} (
                                    {agreement.signedByAdmin.email})
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAgreementModalOpen(false)}
                        >
                            Close
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => {
                                if (agreement && store) {
                                    generateAndDownloadAgreementPdf({
                                        name: agreement.signerName || vendor.fullName,
                                        phone: agreement.signerPhone || vendor.primaryPhone,
                                        storeId: store.id,
                                        date: formatDate(agreement.signedAt),
                                        verificationMethod: agreement.verificationMethod,
                                        verificationIdentifier: agreement.verificationIdentifier,
                                    })
                                }
                            }}
                        >
                            Download PDF
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
