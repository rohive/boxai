/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: [],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://boxai-backend.vercel.app/api/:path*',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/index',
        permanent: true,
      },
    ]
  },
  // Add any other Next.js configuration options here
};

module.exports = nextConfig;
