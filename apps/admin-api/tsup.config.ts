import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["src/app.ts"],
    outDir: "api",
    format: ["cjs"],
    splitting: false,
    clean: false,
    bundle: true,
    noExternal: [/.*/],
    outExtension: () => ({ js: ".cjs" }),
})
