/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Optimize for production deployment
  images: {
    domains: ['lh3.googleusercontent.com'], // Allow Google profile images
  },
  // Add trailingSlash to ensure proper route handling
  trailingSlash: false
};

module.exports = nextConfig;