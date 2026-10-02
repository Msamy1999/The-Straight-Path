import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import { articleRedirects } from "./data/article-redirects";

const scriptSources = [
  "'self'",
  "'unsafe-inline'",
  ...(process.env.NODE_ENV === "development" ? ["'unsafe-eval'"] : []),
  "https://translate.google.com",
  "https://translate.googleapis.com",
  // The official Translate widget loads its supported-language callback here.
  "https://translate-pa.googleapis.com",
  "https://www.gstatic.com",
];

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSources.join(" ")}`,
  "style-src 'self' 'unsafe-inline' https://translate.googleapis.com https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://translate.google.com https://www.gstatic.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.gstatic.com",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "frame-src https://translate.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

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
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "0" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
  async redirects() {
    return Object.entries(articleRedirects).map(([source, destination]) => ({
      source: `/articles/${source}`,
      destination: `/articles/${destination}`,
      permanent: true,
    }));
  },
  // Load msedge-tts from node_modules at runtime instead of bundling it —
  // bundling breaks/throttles its websocket streaming (12s vs 1.5s per call).
  serverExternalPackages: ["msedge-tts"],
};

export default withPayload(nextConfig);
