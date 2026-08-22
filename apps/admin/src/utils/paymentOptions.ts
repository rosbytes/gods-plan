interface generatePaymentOptionsPrams {
    orderData: {
        keyId: string
        amount: number
        orderId: string
        vendorName: string
        vendorContact: string
    }
    verifyMutation: {
        mutate: (data: any) => void
    }
    storeId: string
    vendorId: string
}

export const generatePaymentOptions = ({
    orderData,
    verifyMutation,
    storeId,
    vendorId,
}: generatePaymentOptionsPrams) => {
    return {
        key: orderData.keyId,
        amount: orderData.amount, // amount in PAISE from backend
        currency: "INR",
        name: "ROS Registration",
        description: "Store Registration Fee",
        order_id: orderData.orderId,
        handler: function (response: any) {
            // Verify payment signature securely on backend
            verifyMutation.mutate({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                storeId,
                vendorId,
            })
        },
        prefill: {
            name: orderData.vendorName,
            contact: orderData.vendorContact,
        },
        theme: {
            color: "#135B47",
        },
    } as RazorpayOptions
}

interface RazorpaySuccesshandlerArgs {
    razorpay_signature: string
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_subscription_id: string
}

export interface RazorpayOptions {
    key: string
    amount?: number
    currency?: string
    name?: string
    description?: string
    image?: string
    order_id?: string
    handler?: (args: RazorpaySuccesshandlerArgs) => void
    prefill?: {
        name?: string
        email?: string
        contact?: string
        method?: "card" | "netbanking" | "wallet" | "emi" | "upi"
    }
    notes?: {}
    theme?: {
        hide_topbar?: boolean
        color?: string
        backdrop_color?: string
    }
    modal?: {
        backdropclose?: boolean
        escape?: boolean
        handleback?: boolean
        confirm_close?: boolean
        ondismiss?: () => void
        animation?: boolean
    }
    subscription_id?: string
    subscription_card_change?: boolean
    recurring?: boolean
    callback_url?: string
    redirect?: boolean
    customer_id?: string
    timeout?: number
    remember_customer?: boolean
    readonly?: {
        contact?: boolean
        email?: boolean
        name?: boolean
    }
    hidden?: {
        contact?: boolean
        email?: boolean
    }
    send_sms_hash?: boolean
    allow_rotation?: boolean
    retry?: {
        enabled?: boolean
        max_count?: boolean
    }
    config?: {
        display: {
            language: "en" | "ben" | "hi" | "mar" | "guj" | "tam" | "tel"
        }
    }
}
