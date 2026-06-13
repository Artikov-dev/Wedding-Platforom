import type { NextConfig } from "next";

// Lokal backend bilan ishlash uchun. Deploy uchun Render manziliga qaytaring:
// const BACKEND = 'https://wedding-backend-8.onrender.com';
const BACKEND = process.env.BACKEND_URL || 'http://localhost:4000';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['127.0.0.1'],
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: `${BACKEND}/:path*`,
      },
    ];
  },
};

export default nextConfig;
