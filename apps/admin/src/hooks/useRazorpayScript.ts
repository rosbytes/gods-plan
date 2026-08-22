// hooks/useRazorpayScript.ts
import { useEffect, useState } from "react"

export function useRazorpayScript() {
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        if (document.getElementById("razorpay-checkout-js")) {
            setLoaded(true)
            return
        }
        const script = document.createElement("script")
        script.id = "razorpay-checkout-js"
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.onload = () => setLoaded(true)
        script.onerror = () => setLoaded(false)
        document.body.appendChild(script)
    }, [])

    return loaded
}
