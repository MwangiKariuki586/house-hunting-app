// Profile Completion Banner for VerifiedNyumba
// Dismissible banner prompting users to complete their profile

"use client";

import * as React from "react";
import Link from "next/link";
import { X, ChevronRight, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";

interface ProfileCompletionBannerProps {
  /** Current profile completeness percentage (0-100) */
  completeness: number;
  /** Current profile tier */
  tier: "BASIC" | "PHONE_VERIFIED" | "ID_VERIFIED" | "FULLY_VERIFIED";
  /** Next step to complete */
  nextStep?: {
    action: string;
    description: string;
    percentageGain: number;
  };
  /** Whether the banner has been dismissed */
  isDismissed?: boolean;
  /** Callback when banner is dismissed */
  onDismiss?: () => void;
  /** Link to profile completion page */
  completeProfileHref?: string;
  className?: string;
}

const LOCAL_STORAGE_KEY = "profile-banner-dismissed";

/**
 * Dismissible banner encouraging profile completion
 * Persists dismissal state in localStorage
 */
export function ProfileCompletionBanner({
  completeness,
  tier,
  nextStep,
  isDismissed: externalDismissed,
  onDismiss,
  completeProfileHref = "/landlord/verification",
  className,
}: ProfileCompletionBannerProps) {
  const [isLocallyDismissed, setIsLocallyDismissed] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  // Check localStorage on mount
  React.useEffect(() => {
    const dismissed = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (dismissed === "true") {
      setIsLocallyDismissed(true);
    } else {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsLocallyDismissed(true);
    localStorage.setItem(LOCAL_STORAGE_KEY, "true");
    onDismiss?.();
  };

  // Don't show if already fully verified or dismissed
  if (
    tier === "FULLY_VERIFIED" ||
    externalDismissed ||
    isLocallyDismissed ||
    !isVisible
  ) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-teal-200 bg-linear-to-r from-teal-50 to-emerald-50 p-4 shadow-sm",
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-teal-100/50" />
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-emerald-100/50" />

      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600">
          <Sparkles className="h-5 w-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-gray-900">
              Complete your profile to unlock more features
            </h3>
            <button
              onClick={handleDismiss}
              className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-linear-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-medium text-teal-700">
              {completeness}%
            </span>
          </div>

          {/* Next step */}
          {nextStep && (
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Circle className="h-3.5 w-3.5 text-teal-500" />
                <span>
                  Next: <span className="font-medium">{nextStep.description}</span>
                </span>
                <span className="text-teal-600">(+{nextStep.percentageGain}%)</span>
              </div>
              <Link href={completeProfileHref}>
                <Button size="sm" variant="default" className="gap-1.5 h-8">
                  Complete Now
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact inline prompt for profile completion
 */
export function ProfileCompletionInline({
  completeness,
  nextStep,
  href = "/landlord/verification",
  className,
}: {
  completeness: number;
  nextStep?: { description: string };
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-teal-300 hover:bg-teal-50/50",
        className
      )}
    >
      <div className="relative h-10 w-10">
        <svg className="h-10 w-10 -rotate-90 transform">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="#14b8a6"
            strokeWidth="4"
            strokeDasharray={`${(completeness / 100) * 100.53} 100.53`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
          {completeness}%
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">Complete your profile</p>
        {nextStep && (
          <p className="text-xs text-gray-500 truncate">
            Next: {nextStep.description}
          </p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-teal-600" />
    </Link>
  );
}

/**
 * Utility to reset dismissal state (for testing)
 */
export function resetBannerDismissal() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}
