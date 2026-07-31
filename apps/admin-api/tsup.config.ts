import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["src/app.ts"],
    outDir: "dist",
    format: ["cjs"],
    splitting: false,
    clean: true,
    bundle: true,
    noExternal: [/.*/],
    outExtension: () => ({ js: ".cjs" }),
})
