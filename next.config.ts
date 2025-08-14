/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Skip ESLint errors during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TypeScript type errors during build
    ignoreBuildErrors: true,
  },
  experimental: {
    appDir: true,
    // Force runtime rendering (skip prerender errors like DOMMatrix)
    forceDynamic: true,
  },
  output: 'standalone',
};

module.exports = nextConfig;
