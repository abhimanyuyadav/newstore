import type { NextConfig } from "next";
const clerkHost = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? Buffer.from(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.split("_").slice(2).join("_"), "base64").toString().replace(/\$/, "") : "";
const clerkOrigin = /^[a-z0-9.-]+$/i.test(clerkHost) ? "https://" + clerkHost : "";
const clerkSources = process.env.NEXT_PUBLIC_AUTH_PROVIDER === "clerk" ? " " + clerkOrigin + " https://challenges.cloudflare.com" : "";
const remoteImagePatterns = [
  ...(process.env.CONVEX_URL ? [{ protocol: "https" as const, hostname: new URL(process.env.CONVEX_URL).hostname, pathname: "/api/storage/**" }] : []),
  { protocol: "https" as const, hostname: "images.unsplash.com" },
  ...(process.env.NEXT_PUBLIC_SUPABASE_URL ? [{ protocol: "https" as const, hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname, pathname: "/storage/v1/object/public/**" }] : []),
];
const nextConfig: NextConfig = {
  output: "standalone",
  // Only public host/path rules are exposed, never storage credentials.
  env: { NEXT_PUBLIC_OPTIMIZED_IMAGE_SOURCES: JSON.stringify(remoteImagePatterns) },
  // Resolve product existence and metadata before streaming an HTTP response.
  htmlLimitedBots: /.*/,
  images: {
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1344, 1600, 1920, 2048, 3840],
    remotePatterns: remoteImagePatterns,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'${clerkSources}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'self'; frame-src 'self'${clerkSources}; worker-src 'self' blob:;`,
          },
        ],
      },
    ];
  },
};
export default nextConfig;
