import { useEffect } from "react"
import { registerSW } from "virtual:pwa-register"
import { toast } from "sonner"
import { useNetworkStatus } from "../../hooks/useNetworkStatus"

export function PwaManager() {
    useNetworkStatus()

    useEffect(() => {
        const updateSW = registerSW({
            immediate: true,
            onNeedRefresh() {
                toast.info("Update available", {
                    id: "pwa-update",
                    description: "A new version of Admin Portal is available.",
                    action: {
                        label: "Reload & Update",
                        onClick: () => {
                            updateSW(true)
                        },
                    },
                    duration: 15000,
                })
            },
            onOfflineReady() {
                // Precached and ready
            },
        })
    }, [])

    return null
}
