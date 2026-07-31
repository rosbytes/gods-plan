import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["src/app.ts"],
    format: ["cjs"],
    splitting: false,
    sourcemap: true,
    clean: true,
    bundle: true,
    // noExternal bundles all the external lib code in the bundlepnpm
    noExternal: [/.*/],
    // outDir: "./dist",
    outExtension: () => ({ js: ".cjs" }),
})
