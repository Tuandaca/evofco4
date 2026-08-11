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
     * Base URL of the .NET backend API.
     * Used on both server and client — safe because it points to our own API, not a secret.
     */
    baseUrl: getEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:5000"),
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
