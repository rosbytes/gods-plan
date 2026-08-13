const start = performance.now()

const app = await import("../dist/index.cjs")

console.log(`App initialization: ${performance.now() - start}ms`)

export default app
