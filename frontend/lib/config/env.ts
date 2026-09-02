/**
 * Centralized environment configuration.
 * All process.env reads are centralized here — never scattered in components.
 */

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(
      `[Config] Missing required environment variable: ${key}. ` +
        `Please copy .env.example to .env.local and fill in the values.`
    );
  }
  return value;
}

export const config = {
  api: {
    /**
     * Base URL for API calls.
     * - Server-side (SSR/RSC): uses full backend URL (NEXT_PUBLIC_API_BASE_URL) for direct connection.
     * - Client-side (browser): uses empty string so requests go through Next.js proxy (/api/v1/*).
     *   This avoids port dependency and CORS issues entirely.
     */
    baseUrl:
      typeof window === "undefined"
        ? getEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:5162")
        : "",
  },

  app: {
    name: "FC Upgrade Intelligence",
    description:
      "Nền tảng phân tích và tối ưu hóa nâng cấp cầu thủ FC Online.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  },

  features: {
    upgrade: process.env.NEXT_PUBLIC_FEATURE_UPGRADE === "true",
    prediction: process.env.NEXT_PUBLIC_FEATURE_PREDICTION === "true",
  },
} as const;
