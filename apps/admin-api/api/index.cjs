// Wrapper that loads the pre-built CJS bundle for Vercel serverless
// Using .cjs extension so Node treats this as CommonJS even with "type": "module"
const app = require("../dist/bundle.cjs")
module.exports = app.default || app
