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
  // Disable server-side rendering for all pages
  // This ensures we only do static generation
  exportPathMap: async function() {
    return {
      '/': { page: '/' },
      '/404': { page: '/404' },
      '/500': { page: '/500' },
    };
  },
  // Disable image optimization API since we're using unoptimized images
  images: {
    loader: 'custom',
    loaderFile: './src/utils/imageLoader.js',
  },
  // Disable the default static export behavior for API routes
  // since we're using an external API
  api: {
    bodyParser: false,
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
