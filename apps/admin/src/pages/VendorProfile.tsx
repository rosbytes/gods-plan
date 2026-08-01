import { useNavigate, useParams } from "react-router-dom"
import { trpc } from "../lib/trpc"

type KycDoc = {
    storefrontUrl?: string
    docId?: string
    frontUrl?: string
    backUrl?: string
}

export default function VendorProfile() {
    const navigate = useNavigate()
    const { vendorId } = useParams<{ vendorId: string }>()

    const { data, isLoading, error } = trpc.vendor.getMarket.useQuery(
        { vendorId: vendorId! },
        { enabled: !!vendorId },
    )

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F6F8]">
                <span className="font-medium text-gray-400">Loading profile...</span>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F6F8]">
                <span className="font-medium text-red-400">Could not load profile.</span>
            </div>
        )
    }

    const { vendor, charge } = data
    const store = vendor.marketStores?.[0]
    const kyc: KycDoc | null = (vendor as any).kycDocs?.[0] ?? null

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

    return (
        <div className="flex min-h-screen flex-col bg-[#F5F6F8] pb-10 font-sans text-gray-900">
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
                {/* Header */}
                <div className="sticky top-0 z-20 flex items-center bg-[#F5F6F8] px-5 pt-12 pb-4 md:px-8 md:pt-8">
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
                        ROS ID: V{shortId}
                    </h1>
                </div>

                <div className="space-y-6 px-5 md:px-8">
                    {/* Top Card */}
                    <div className="flex items-center gap-4 rounded-2xl bg-white p-4.5 shadow-sm">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                            <div className="flex h-full w-full items-center justify-center bg-gray-100">
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
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[17px] font-bold tracking-tight text-gray-900 md:text-lg">
                                {store?.storeName || vendor.fullName}
                            </span>
                            <span className="text-[14px] font-medium text-gray-400 capitalize">
                                Market Vendor
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
                                            {charge?.transactionId || "N/A"}
                                        </span>
                                    </span>
                                    {charge?.transactionId && (
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
                    </div>
                </div>
            </div>
        </div>
    )
}
