import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"
import sharedAssetsPlugin from "./vite.shared-assets"
import pwaOptions from "./vite.pwa"

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss(), sharedAssetsPlugin(), VitePWA(pwaOptions)],
})
