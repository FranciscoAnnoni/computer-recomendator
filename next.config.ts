import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.100.14", "192.168.1.67"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "orxstqqcsxatxaprqyvq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
