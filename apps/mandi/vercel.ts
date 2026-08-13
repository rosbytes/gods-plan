import { type VercelConfig, routes } from "@vercel/config/v1"

export const config: VercelConfig = {
    rewrites: [routes.rewrite("/(.*)", "/index.html")],
}
