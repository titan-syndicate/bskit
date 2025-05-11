/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the static export requirement
  // output: 'export',  // Static HTML export
  images: {
    unoptimized: true, // Disable image optimization
  },
  // Disable features that might use private APIs
  experimental: {
    optimizeCss: false,
    optimizePackageImports: false,
  },
  // Ensure we're not using any server-side features
  reactStrictMode: true,
  swcMinify: true,
}

export default nextConfig
