import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5162";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s1.fifaaddict.com",
        pathname: "/**",
      },
    ],
  },

  /**
   * Proxy /api/v1/* → .NET Backend
   * Client components gọi `/api/v1/...` (tương đối, không cần biết port backend).
   * Next.js server sẽ forward request sang backend.
   * Không bao giờ bị lỗi port / env không load nữa.
   */
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
