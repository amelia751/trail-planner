import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Disable server components minification to avoid AI API errors
  experimental: {
    serverMinification: false,
  },
};

export default nextConfig;

