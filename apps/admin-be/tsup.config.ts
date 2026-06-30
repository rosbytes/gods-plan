import { defineConfig } from "tsup"

export default defineConfig({
    entry: {
        bundle: "src/app.ts",
    },
    format: ["cjs"],
    splitting: false,
    sourcemap: true,
    clean: false,
    bundle: true,
    noExternal: [/.*/],
    outDir: "./dist",
    outExtension: () => ({ js: ".cjs" }),
})
