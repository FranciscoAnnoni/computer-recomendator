import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => ({
  outputFileTracingRoot: process.cwd(),
  ...(phase === PHASE_DEVELOPMENT_SERVER && {
    allowedDevOrigins: ["192.168.1.*", "10.*"],
  }),
  turbopack: {},
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
      {
        protocol: "https",
        hostname: "http2.mlstatic.com",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
    ],
  },
});

export default nextConfig;
