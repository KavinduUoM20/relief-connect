import type { NextConfig } from 'next';

const nextI18nextConfig = require('./next-i18next.config.js');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@nx-mono-repo-deployment-test/shared'],
  experimental: {
    externalDir: true,
  },
  i18n: nextI18nextConfig.i18n,
};

export default nextConfig;

