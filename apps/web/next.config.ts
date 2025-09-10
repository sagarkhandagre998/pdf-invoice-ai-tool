import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { dev, isServer }) => {
    // Fix for Windows file system issues
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    // Disable webpack cache on Windows to prevent ENOENT errors
    if (process.platform === 'win32') {
      config.cache = false;
    }
    
    return config;
  },
  
  // Disable Next.js cache on Windows
  experimental: {
    ...(process.platform === 'win32' && {
      webpackBuildWorker: false,
    }),
  },
};

export default nextConfig;
