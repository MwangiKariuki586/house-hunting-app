"use client";

/**
 * Global Error Boundary
 * 
 * This is the root-level error boundary that catches errors not handled
 * by route-specific error boundaries. It wraps the entire application
 * and provides a fallback UI when critical errors occur.
 * 
 * Note: This must include its own <html> and <body> tags as it replaces
 * the root layout when an error occurs.
 */

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: "#fee2e2" }}
            >
              <AlertTriangle
                className="h-10 w-10"
                style={{ color: "#dc2626" }}
              />
            </div>

            {/* Error Message */}
            <h1
              className="mb-2 text-3xl font-bold"
              style={{ color: "#111827" }}
            >
              Oops! Something went wrong
            </h1>
            <p className="mb-8" style={{ color: "#6b7280" }}>
              We&apos;re sorry, but something unexpected happened. Our team has
              been notified and is working to fix the issue.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === "development" && error.message && (
              <div
                className="mb-8 rounded-lg p-4 text-left"
                style={{ backgroundColor: "#f3f4f6" }}
              >
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: "#6b7280" }}
                >
                  Error Details:
                </p>
                <p
                  className="text-sm font-mono break-all"
                  style={{ color: "#374151" }}
                >
                  {error.message}
                </p>
                {error.digest && (
                  <p className="mt-2 text-xs" style={{ color: "#6b7280" }}>
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: "#1B4D3E",
                color: "white",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#2D6A4F")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#1B4D3E")
              }
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>

            <p className="mt-6 text-sm" style={{ color: "#9ca3af" }}>
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
