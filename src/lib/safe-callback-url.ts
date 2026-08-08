/**
 * Only allow same-origin relative paths after login.
 * Rejects protocol-relative URLs (`//evil.example`) and backslash tricks.
 */
export function safeCallbackUrl(url: string | undefined | null, fallback = "/materials"): string {
  if (!url) return fallback;
  if (!url.startsWith("/") || url.startsWith("//") || url.includes("\\")) {
    return fallback;
  }
  return url;
}
