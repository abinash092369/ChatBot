import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@chatbot/types', '@chatbot/utils', '@chatbot/api-client'],
  reactStrictMode: true,
};

export default nextConfig;
