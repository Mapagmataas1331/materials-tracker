import type { NextConfig } from "next";

/**
 * Baseline hardening headers (ТЗ п.13). The Content-Security-Policy header
 * is intentionally NOT set here — it needs a fresh per-request nonce, so
 * it is generated in src/proxy.ts instead. Everything below is static and
 * safe to apply to every response, including static assets.
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Browsers only ever honour this over an actual HTTPS connection, so it
  // is harmless to send even before HTTPS is configured on the reverse
  // proxy — see README «Развёртывание» for the recommended TLS setup.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
