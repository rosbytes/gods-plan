import { useNavigate, useParams } from "react-router-dom"
import { trpc } from "../lib/trpc"

export default function FinalSuccess() {
    const navigate = useNavigate()
    const { vendorId, storeId } = useParams<{ vendorId: string; storeId: string }>()

    const { data: kycData, isLoading } = trpc.store.getKyc.useQuery(
        { vendorId: vendorId!, storeId: storeId! },
        { enabled: !!vendorId && !!storeId },
    )

    const shortId = vendorId ? vendorId.substring(0, 4).toUpperCase() : "0000"

    return (
        <div className="flex min-h-screen flex-col bg-[#F5F6F8] pb-32 font-sans text-gray-900">
            <div className="flex flex-col items-center px-6 pt-16">
                {/* Success Checkmark Component */}
                <div className="mb-6 flex h-20 w-20 transform items-center justify-center rounded-full bg-[#6CC091] shadow-lg transition-transform hover:scale-105">
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>

                {/* Headers */}
                <h1 className="mb-2 text-[28px] font-bold tracking-tight text-gray-900">
                    Vendor Registered
                </h1>
                <h2 className="mb-8 text-[16px] font-bold tracking-wide text-gray-600">
                    ROS ID: V{shortId}
                </h2>

                {/* Store Image Preview Frame */}
                <div className="animate-in fade-in zoom-in relative aspect-4/3 w-full max-w-[350px] overflow-hidden rounded-[16px] bg-gray-200 shadow-lg duration-500">
                    {isLoading ? (
                        <div className="flex h-full w-full items-center justify-center">
                            <span className="text-sm font-semibold text-gray-400">
                                Loading storefront...
                            </span>
                        </div>
                    ) : kycData?.kyc?.storefrontUrl ? (
                        <img
                            src={kycData.kyc.storefrontUrl}
                            alt="Storefront"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <span className="text-sm font-semibold text-gray-400">
                                No Store Image Available
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="fixed bottom-0 left-0 w-full bg-linear-to-t from-[#F5F6F8] via-[#F5F6F8] to-transparent px-5 py-6">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full rounded-[18px] bg-[#135B47] py-[18px] text-[16px] font-semibold text-white shadow-md transition-colors hover:bg-[#0f4d3c]"
                >
                    Dashboard
                </button>
            </div>
        </div>
    )
}
