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
      },
      {
        protocol: 'https',
        hostname: 'logos-download.com'
      }
    ]
  },
  eslint: {
    ignoreDuringBuilds: true // Ignores ESLint issues during production build
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
