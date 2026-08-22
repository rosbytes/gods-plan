import type { VitePWAOptions } from "vite-plugin-pwa"

const pwaOptions = {
    registerType: "autoUpdate",
    injectRegister: "auto",
    manifest: {
        id: "/",
        name: "Admin Portal - ROS",
        short_name: "Admin",
        start_url: "/",
        scope: "/",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
        orientation: "any",
        categories: ["business", "productivity", "management"],
        background_color: "#ffffff",
        theme_color: "#ffffff",
        shortcuts: [
            {
                name: "Dashboard",
                short_name: "Dashboard",
                description: "View Admin Dashboard and stats",
                url: "/dashboard",
                icons: [{ src: "/icons/maskable_icon_x96.png", sizes: "96x96" }],
            },
            {
                name: "New Vendor",
                short_name: "New Vendor",
                description: "Onboard a new vendor",
                url: "/create-vendor",
                icons: [{ src: "/icons/maskable_icon_x96.png", sizes: "96x96" }],
            },
            {
                name: "Manage Mandis",
                short_name: "Mandis",
                description: "Manage Mandi locations",
                url: "/manage/mandis",
                icons: [{ src: "/icons/maskable_icon_x96.png", sizes: "96x96" }],
            },
        ],
        icons: [
            {
                purpose: "any",
                sizes: "48x48",
                src: "/icons/maskable_icon_x48.png",
                type: "image/png",
            },
            {
                purpose: "any",
                sizes: "72x72",
                src: "/icons/maskable_icon_x72.png",
                type: "image/png",
            },
            {
                purpose: "any",
                sizes: "96x96",
                src: "/icons/maskable_icon_x96.png",
                type: "image/png",
            },
            {
                purpose: "any",
                sizes: "128x128",
                src: "/icons/maskable_icon_x128.png",
                type: "image/png",
            },
            {
                purpose: "any",
                sizes: "192x192",
                src: "/icons/maskable_icon_x192.png",
                type: "image/png",
            },
            {
                purpose: "any",
                sizes: "384x384",
                src: "/icons/maskable_icon_x384.png",
                type: "image/png",
            },
            {
                purpose: "any",
                sizes: "512x512",
                src: "/icons/maskable_icon_x512.png",
                type: "image/png",
            },
            {
                purpose: "maskable",
                sizes: "192x192",
                src: "/icons/maskable_icon_x192.png",
                type: "image/png",
            },
            {
                purpose: "maskable",
                sizes: "512x512",
                src: "/icons/maskable_icon_x512.png",
                type: "image/png",
            },
            {
                purpose: "maskable",
                sizes: "1024x1024",
                src: "/icons/maskable_icon.png",
                type: "image/png",
            },
        ],
    },
    workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2}"],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
            {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: "CacheFirst",
                options: {
                    cacheName: "google-fonts-cache",
                    expiration: {
                        maxEntries: 10,
                        maxAgeSeconds: 60 * 60 * 24 * 365,
                    },
                    cacheableResponse: {
                        statuses: [0, 200],
                    },
                },
            },
            {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: "CacheFirst",
                options: {
                    cacheName: "gstatic-fonts-cache",
                    expiration: {
                        maxEntries: 10,
                        maxAgeSeconds: 60 * 60 * 24 * 365,
                    },
                    cacheableResponse: {
                        statuses: [0, 200],
                    },
                },
            },
        ],
    },
    devOptions: {
        enabled: false,
    },
} satisfies Partial<VitePWAOptions>

export default pwaOptions
