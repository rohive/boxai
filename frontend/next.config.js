/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  assetPrefix: isProd ? '/frontend' : '',
  basePath: isProd ? '/frontend' : '',
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  images: {
    domains: [],
    unoptimized: true,
    disableStaticImages: true,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react', 'react-icons'],
  },
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
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
