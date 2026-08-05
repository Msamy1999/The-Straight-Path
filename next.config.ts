import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/articles/judgment-day",
        destination: "/articles/the-day-of-judgment",
        permanent: true,
      },
    ];
  },
  // Load msedge-tts from node_modules at runtime instead of bundling it —
  // bundling breaks/throttles its websocket streaming (12s vs 1.5s per call).
  serverExternalPackages: ["msedge-tts"],
};

export default withPayload(nextConfig);
