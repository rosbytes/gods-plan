import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    format: ["cjs"],
    splitting: false,
    clean: true,
    bundle: true,
    noExternal: [/.*/],
    // noExternal: ["@ros/db", "@ros/commons", "cookie"],
    outExtension: () => ({ js: ".cjs" }),
})
