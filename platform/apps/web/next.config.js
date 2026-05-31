/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Proxy API calls to the backend so the browser can use same-origin /api.
  async rewrites() {
    const apiUrl = process.env.API_PROXY_URL || 'http://localhost:3002';
    return [{ source: '/api/:path*', destination: `${apiUrl}/api/:path*` }];
  },
};

module.exports = nextConfig;
