import { defineConfig } from "tsdown"

export default defineConfig({
    clean: true,
    minify: true,
    entry: ["./src/app.ts"],
    //   dts: false
    //   sourcemap: "inline"
})
