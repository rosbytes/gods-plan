import { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function usePwaInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isInstalled, setIsInstalled] = useState<boolean>(() => {
        if (typeof window === "undefined") return false
        return (
            (typeof window.matchMedia === "function" &&
                window.matchMedia("(display-mode: standalone)").matches) ||
            (window.navigator as unknown as { standalone?: boolean })?.standalone === true
        )
    })

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
        }

        const handleAppInstalled = () => {
            setIsInstalled(true)
            setDeferredPrompt(null)
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        window.addEventListener("appinstalled", handleAppInstalled)

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
            window.removeEventListener("appinstalled", handleAppInstalled)
        }
    }, [])

    const install = async () => {
        if (!deferredPrompt) return false
        await deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        if (choice.outcome === "accepted") {
            setDeferredPrompt(null)
            return true
        }
        return false
    }

    return {
        canInstall: Boolean(deferredPrompt) && !isInstalled,
        isInstalled,
        install,
    }
}
