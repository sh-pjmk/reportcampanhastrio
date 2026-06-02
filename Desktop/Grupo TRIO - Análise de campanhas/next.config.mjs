/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GHL_LOCATION_ID: process.env.GHL_LOCATION_ID,
  },
  api: {
    responseLimit: false,
  },
};

export default nextConfig;
