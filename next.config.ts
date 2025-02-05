import { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},
  images:{
    domains: ['res.cloudinary.com'], 
  },
  eslint: {
    ignoreDuringBuilds: true, // Disables ESLint checks during builds (e.g., on Vercel)
  }, // Remove unrecognized keys
};

export default nextConfig;
