import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { parseVendorType } from "../constants/vendor"

export default function Success() {
    const navigate = useNavigate()
    const { vendorId, storeId } = useParams<{ vendorId: string; storeId: string }>()
    const [searchParams] = useSearchParams()
    const vendorType = parseVendorType(searchParams.get("type"))
    const typeParam = vendorType ? `?type=${vendorType}` : ""

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F6F8] px-6">
            <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center space-y-6 text-center">
                {/* Success Checkmark */}
                <div className="flex h-20 w-20 transform items-center justify-center rounded-full bg-[#6CC091] shadow-lg transition-transform hover:scale-110">
                    <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <h1 className="text-[24px] font-bold tracking-tight text-gray-900 md:text-3xl">
                        Details Saved Successfully
                    </h1>
                </div>
            </div>

            {/* Bottom Button */}
            <div className="fixed bottom-0 left-0 w-full px-5 py-6 md:left-1/2 md:max-w-xl md:-translate-x-1/2 md:px-8">
                <button
                    onClick={() => navigate(`/payment/${vendorId}/${storeId}${typeParam}`)}
                    className="w-full cursor-pointer rounded-[18px] bg-[#135B47] py-4.5 text-[16px] font-semibold text-white shadow-md transition-colors hover:bg-[#0f4d3c]"
                >
                    Proceed to payment
                </button>
            </div>
        </div>
    )
}
