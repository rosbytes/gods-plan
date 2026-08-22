/**
 * @ros/assets
 * Central repository for shared brand, favicons, logos, and PWA icons.
 */

export const ASSET_NAMES = {
    brand: {
        rosBlack: "ros-black.svg",
        headerRos: "headerRos.svg",
    },
    favicons: {
        svg: "favicon.svg",
    },
    pwaIcons: [
        "maskable_icon_x48.png",
        "maskable_icon_x72.png",
        "maskable_icon_x96.png",
        "maskable_icon_x128.png",
        "maskable_icon_x192.png",
        "maskable_icon_x384.png",
        "maskable_icon_x512.png",
        "maskable_icon.png",
    ],
} as const
