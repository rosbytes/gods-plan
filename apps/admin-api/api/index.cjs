// Vercel serverless function entry point
const app = require("../dist/app.cjs")
module.exports = app.default || app
