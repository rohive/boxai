/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  images: {
    unoptimized: true,
    domains: [],
  },
  compiler: {
    styledComponents: true,
  },
  trailingSlash: true,
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
