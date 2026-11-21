/**
 * Error Monitoring & Telemetry Wrapper
 * Configured safely via environment variables without hardcoded keys.
 */

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (dsn) {
    // When Sentry DSN is configured, errors are sent to Sentry
    try {
      // Dynamic hook for Sentry reporting
      if (typeof window !== "undefined" && (window as unknown as { Sentry?: { captureException: (e: unknown, ctx: unknown) => void } }).Sentry) {
        (window as unknown as { Sentry: { captureException: (e: unknown, ctx: unknown) => void } }).Sentry.captureException(error, { extra: context });
      }
    } catch {
      // Silently fall back to console
    }
  }

  // Structured error output for Vercel Log Drains
  console.error("[TELEMETRY_ERROR]", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  });
}
