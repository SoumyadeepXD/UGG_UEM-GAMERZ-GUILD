import { NextRequest, NextResponse } from "next/server";

export interface SameOriginOptions {
  requireJson?: boolean;
}

/**
 * Validates same-origin write requests to protect against CSRF and cross-origin attacks.
 * Rejects unless:
 *   - Sec-Fetch-Site is 'same-origin' or 'none', OR
 *   - Origin host matches the Host / X-Forwarded-Host header.
 * If requireJson is true, Content-Type must contain application/json.
 * Returns null if allowed, or a 403 NextResponse if rejected.
 */
export function validateSameOrigin(
  request: NextRequest,
  options: SameOriginOptions = {}
): NextResponse | null {
  const { requireJson = false } = options;

  const secFetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");

  // 1. If Sec-Fetch-Site is explicitly cross-site or not in allowlist, reject
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "none") {
    return NextResponse.json(
      { error: "Forbidden: Cross-origin request rejected (Sec-Fetch-Site)" },
      { status: 403 }
    );
  }

  // 2. Check condition A: Sec-Fetch-Site is same-origin or none
  const isSecFetchValid = secFetchSite === "same-origin" || secFetchSite === "none";

  // 3. Check condition B: Origin host matches Host
  let isOriginValid = false;
  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      const hostOnly = host.split(":")[0].toLowerCase();
      if (
        originUrl.host.toLowerCase() === host.toLowerCase() ||
        originUrl.hostname.toLowerCase() === hostOnly
      ) {
        isOriginValid = true;
      }
    } catch {
      return NextResponse.json(
        { error: "Forbidden: Malformed Origin header" },
        { status: 403 }
      );
    }
  }

  // If Origin is present but doesn't match host, reject
  if (origin && !isOriginValid) {
    return NextResponse.json(
      { error: "Forbidden: Cross-origin request rejected (Origin mismatch)" },
      { status: 403 }
    );
  }

  // Reject unless Sec-Fetch-Site is same-origin/none or Origin host matches Host header
  if (!isSecFetchValid && !isOriginValid) {
    return NextResponse.json(
      { error: "Forbidden: Missing valid same-origin security headers" },
      { status: 403 }
    );
  }

  // 4. Require Content-Type application/json on JSON routes
  if (requireJson) {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return NextResponse.json(
        { error: "Forbidden: Request Content-Type must be application/json" },
        { status: 403 }
      );
    }
  }

  return null;
}
