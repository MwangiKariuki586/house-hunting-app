"use client";

/**
 * Error Boundary for Main Route Group
 * 
 * This component catches errors in the main public-facing pages including:
 * - Homepage
 * - Properties listing
 * - Property details
 * - About page
 * - Services page
 * 
 * Provides a user-friendly error UI with retry functionality.
 */

import * as React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { formatErrorForClient } from "@/app/lib/client-error";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MainError({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Log the error to an error reporting service in production
    // For now, we log to console during development
    console.error("Main route error:", error);
  }, [error]);

  const presentation = formatErrorForClient(error);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>

        {/* Error Message */}
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          {presentation.title}
        </h1>
        <p className="mb-6 text-gray-600">
          {presentation.message}
        </p>

        {/* Reference Details (development only, without raw backend errors) */}
        {process.env.NODE_ENV === "development" && presentation.referenceId && (
          <div className="mb-6 rounded-lg bg-gray-100 p-4 text-left">
            <p className="text-xs font-medium text-gray-500 mb-1">
              Reference ID:
            </p>
            <p className="text-sm text-gray-700 font-mono break-all">
              {presentation.referenceId}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            variant="default"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
