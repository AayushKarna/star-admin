import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.starhifi.com'
      },
      {
        protocol: 'http',
        hostname: 'localhost'
      },
      {
        protocol: 'https',
        hostname: 'logos-world.net'
      }
    ]
  },
  eslint: {
    ignoreDuringBuilds: true // Ignores ESLint issues during production build
  }
};

export default nextConfig;
