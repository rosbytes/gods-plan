import { useEffect, useState } from "react"

const SCRIPT_ID = "msg91-otp-provider-script"
const SCRIPT_SRC = "https://verify.msg91.com/otp-provider.js"

export function useMsg91OtpScript() {
    const [loaded, setLoaded] = useState(() => Boolean(document.getElementById(SCRIPT_ID)))

    useEffect(() => {
        const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
        if (existing) {
            setLoaded(true)
            return
        }

        const script = document.createElement("script")
        script.id = SCRIPT_ID
        script.type = "text/javascript"
        script.src = SCRIPT_SRC
        script.onload = () => setLoaded(true)
        script.onerror = () => setLoaded(false)
        document.body.appendChild(script)
    }, [])

    return loaded
}
