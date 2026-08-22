import fs from "node:fs"
import path from "node:path"

export default function sharedAssetsPlugin() {
    const assetsDir = path.resolve(import.meta.dirname, "../../packages/assets")

    return {
        name: "shared-assets-plugin",
        configureServer(server: any) {
            server.middlewares.use((req: any, res: any, next: any) => {
                if (req.url === "/favicon.svg") {
                    res.setHeader("Content-Type", "image/svg+xml")
                    fs.createReadStream(path.join(assetsDir, "favicons/favicon.svg")).pipe(res)
                    return
                }
                if (req.url?.startsWith("/icons/")) {
                    const iconName = req.url.replace("/icons/", "")
                    const iconPath = path.join(assetsDir, "icons", iconName)
                    if (fs.existsSync(iconPath)) {
                        res.setHeader("Content-Type", "image/png")
                        fs.createReadStream(iconPath).pipe(res)
                        return
                    }
                }
                next()
            })
        },
        generateBundle(this: any) {
            const favPath = path.join(assetsDir, "favicons/favicon.svg")
            if (fs.existsSync(favPath)) {
                this.emitFile({
                    type: "asset",
                    fileName: "favicon.svg",
                    source: fs.readFileSync(favPath),
                })
            }
            const iconsDir = path.join(assetsDir, "icons")
            if (fs.existsSync(iconsDir)) {
                for (const file of fs.readdirSync(iconsDir)) {
                    this.emitFile({
                        type: "asset",
                        fileName: `icons/${file}`,
                        source: fs.readFileSync(path.join(iconsDir, file)),
                    })
                }
            }
        },
    }
}
