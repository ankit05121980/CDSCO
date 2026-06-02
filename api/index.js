// Vercel serverless function handling all /api/* requests (via the rewrite in
// vercel.json). Delegates to the compiled NestJS app (built during the Vercel
// build). The Nest app is created once and cached across warm invocations.
const handler = require('../backend/dist/serverless').default;

module.exports = (req, res) => handler(req, res);
