import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.paypal.com',
        port: '',
        pathname: '**',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
