/**
 * URL Allowlist Validation for Tournament Posters and External Registration Links.
 * Enforces strict HTTPS and hostname restrictions to prevent SSRF and malicious redirection.
 */

const EXPLICIT_ALLOWED_POSTER_HOSTS = new Set([
  "images.unsplash.com",
]);

/**
 * Validates that a poster URL is HTTPS and belongs to an authorized CDN host
 * (Supabase Storage CDN or explicit allowlist entries).
 */
export function isAllowlistedPosterUrl(rawUrl?: string | null): boolean {
  if (!rawUrl || typeof rawUrl !== "string") return false;
  const trimmed = rawUrl.trim();
  if (!trimmed.startsWith("https://")) return false;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return false;

    const hostname = parsed.hostname.toLowerCase();

    // 1. Check if host matches configured Supabase project exact hostname
    const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (configuredSupabaseUrl) {
      try {
        const sbHost = new URL(configuredSupabaseUrl).hostname.toLowerCase();
        if (hostname === sbHost) return true;
      } catch {
        // Continue checking
      }
    }

    // 2. Allow explicit approved CDNs only (no wildcard *.supabase.co)
    if (EXPLICIT_ALLOWED_POSTER_HOSTS.has(hostname)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Validates registration links.
 * Requires HTTPS and rejects dangerous protocols (javascript:, data:, file:).
 */
export function isValidRegistrationUrl(rawUrl?: string | null): boolean {
  if (!rawUrl || typeof rawUrl !== "string") return false;
  const trimmed = rawUrl.trim();
  if (!trimmed.startsWith("https://")) return false;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}
