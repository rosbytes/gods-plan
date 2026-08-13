import { type VercelConfig, routes } from "@vercel/config/v1"

export const config: VercelConfig = {
    // framework: "express",
    // rewrites: [routes.rewrite("/(.*)", "/api")],
    routes: [
        {
            src: "/(.*)",
            dest: "/api",
        },
    ],
}
