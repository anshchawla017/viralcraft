// Vercel serverless function entry point.
// This only ever handles requests to /api/* and the root "/" catch-all
// (see vercel.json rewrite). Static assets (index.html, style.css, app.js
// in /public) are served directly by Vercel, not through this function.
const app = require('../server/app');

module.exports = app;
