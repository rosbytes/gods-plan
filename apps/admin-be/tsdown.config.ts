import { defineConfig } from "tsdown"

export default defineConfig({
    entry: ["./src/app.ts"],
    // Generate the defination files
    //   dts: false

    //   sourcemap: "inline"

    // Bundles all the depencidecies code as well
    // deps: {
    //     alwaysBundle: [/.*/],
    // },
    // unbundle: false,
    // format: ["cjs"],
})
