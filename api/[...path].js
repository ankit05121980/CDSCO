// Vercel serverless function — catch-all for /api/* (and the API root).
// Delegates to the compiled NestJS app (built during the Vercel build step).
// The Nest app is created once and cached across warm invocations.
const handler = require('../backend/dist/serverless').default;

module.exports = (req, res) => handler(req, res);
