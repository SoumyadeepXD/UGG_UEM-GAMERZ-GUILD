"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical root error caught by global error boundary:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: "20px",
          minHeight: "100vh",
          backgroundColor: "#060709",
          color: "#f4f4f6",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "460px",
            width: "100%",
            backgroundColor: "#0d0f17",
            border: "1px solid rgba(255, 30, 56, 0.4)",
            borderRadius: "24px",
            padding: "32px 24px",
            textAlign: "center",
            boxShadow: "0 0 40px rgba(255, 30, 56, 0.2)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              backgroundColor: "rgba(255, 30, 56, 0.1)",
              border: "1px solid rgba(255, 30, 56, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
              fontSize: "28px",
            }}
          >
            ⚠️
          </div>

          <h1
            style={{
              fontSize: "22px",
              fontWeight: 900,
              color: "#ffffff",
              textTransform: "uppercase",
              letterSpacing: "-0.5px",
              margin: "0 0 8px 0",
            }}
          >
            Critical Arena Failure
          </h1>

          <p
            style={{
              fontSize: "13px",
              color: "#9ca3af",
              lineHeight: "1.6",
              margin: "0 0 24px 0",
            }}
          >
            A critical system error occurred. Please reload to restore connection.
          </p>

          {error.digest && (
            <p
              style={{
                fontSize: "10px",
                fontFamily: "monospace",
                color: "#6b7280",
                margin: "0 0 20px 0",
              }}
            >
              Digest: {error.digest}
            </p>
          )}

          <button
            onClick={() => reset()}
            style={{
              width: "100%",
              minHeight: "44px",
              padding: "12px 20px",
              borderRadius: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "12px",
              color: "#ffffff",
              backgroundColor: "#ff1e38",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(255, 30, 56, 0.4)",
              transition: "background-color 0.2s",
            }}
          >
            Reload Arena
          </button>
        </div>
      </body>
    </html>
  );
}
