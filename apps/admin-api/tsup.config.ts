import { defineConfig } from "tsup"

export default defineConfig({
    entry: {
        index: "src/app.ts",
    },
    outDir: "api",
    format: ["cjs"],
    splitting: false,
    clean: true,
    bundle: true,
    // noExternal bundles all the external lib code in the bundlepnpm
    noExternal: [/.*/],
    outExtension: () => ({ js: ".cjs" }),
})
