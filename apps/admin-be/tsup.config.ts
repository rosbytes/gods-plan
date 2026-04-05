import { defineConfig } from "tsup"

export default defineConfig({
    entry: {
        index: "src/app.ts",
    },
    format: ["cjs"],
    splitting: false,
    sourcemap: true,
    clean: true,
    bundle: true,
    noExternal: [/.*/],
    outDir: "api",
    outExtension: () => ({ js: ".cjs" }),
})
