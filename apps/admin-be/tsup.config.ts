import { defineConfig } from "tsup"

export default defineConfig({
    entry: {
        index: "src/app.ts",
    },
    format: ["cjs"],
    splitting: false,
    sourcemap: true,
    clean: false,
    bundle: true,
    noExternal: [/.*/],
    outDir: ".",
    outExtension: () => ({ js: ".cjs" }),
})
