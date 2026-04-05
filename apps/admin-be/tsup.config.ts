import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["src/server.ts"],
    format: ["cjs"],
    splitting: false,
    sourcemap: true,
    clean: true,
    bundle: true,
    noExternal: [/.*/],
    outExtension: () => ({ js: ".js" }),
})
