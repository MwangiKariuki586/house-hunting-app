// Feature Gate Component for VerifiedNyumba
// Conditionally renders content based on user's profile tier

"use client";

import * as React from "react";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { cn } from "@/app/lib/utils";

export type ProfileTier = "BASIC" | "PHONE_VERIFIED" | "ID_VERIFIED" | "FULLY_VERIFIED";

interface FeatureGateProps {
  /** User's current tier */
  currentTier: ProfileTier;
  /** Minimum tier required to access this feature */
  requiredTier: ProfileTier;
  /** Content to show when user has access */
  children: React.ReactNode;
  /** Content to show when user doesn't have access (optional - defaults to upgrade prompt) */
  fallback?: React.ReactNode;
  /** Feature name for the upgrade prompt */
  featureName?: string;
  /** Callback when user clicks upgrade */
  onUpgrade?: () => void;
}

const tierLevel: Record<ProfileTier, number> = {
  BASIC: 0,
  PHONE_VERIFIED: 1,
  ID_VERIFIED: 2,
  FULLY_VERIFIED: 3,
};

const tierNames: Record<ProfileTier, string> = {
  BASIC: "Basic",
  PHONE_VERIFIED: "Phone Verified",
  ID_VERIFIED: "ID Verified",
  FULLY_VERIFIED: "Fully Verified",
};

const upgradeSteps: Record<ProfileTier, string> = {
  BASIC: "Create an account",
  PHONE_VERIFIED: "Verify your phone number",
  ID_VERIFIED: "Upload your ID document",
  FULLY_VERIFIED: "Complete property verification",
};

/**
 * Conditionally renders content based on verification tier
 * Shows upgrade prompt when user doesn't meet requirements
 */
export function FeatureGate({
  currentTier,
  requiredTier,
  children,
  fallback,
  featureName,
  onUpgrade,
}: FeatureGateProps) {
  const hasAccess = tierLevel[currentTier] >= tierLevel[requiredTier];

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  return (
    <UpgradePrompt
      requiredTier={requiredTier}
      featureName={featureName}
      onUpgrade={onUpgrade}
    />
  );
}

interface UpgradePromptProps {
  requiredTier: ProfileTier;
  featureName?: string;
  onUpgrade?: () => void;
  className?: string;
}

/**
 * Standalone upgrade prompt component
 */
export function UpgradePrompt({
  requiredTier,
  featureName,
  onUpgrade,
  className,
}: UpgradePromptProps) {
  return (
    <Card className={cn("border-dashed border-gray-300 bg-gray-50/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
            <Lock className="h-4 w-4 text-gray-500" />
          </div>
          <CardTitle className="text-base text-gray-700">
            {featureName ? `${featureName} Locked` : "Feature Locked"}
          </CardTitle>
        </div>
        <CardDescription className="text-sm">
          This feature requires {tierNames[requiredTier]} status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            {upgradeSteps[requiredTier]} to unlock this feature.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onUpgrade}
            className="gap-2"
          >
            Upgrade Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Inline lock indicator for smaller UI elements
 */
export function LockedFeatureInline({
  requiredTier,
  onClick,
  className,
}: {
  requiredTier: ProfileTier;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 transition-colors",
        className
      )}
    >
      <Lock className="h-3 w-3" />
      <span>Requires {tierNames[requiredTier]}</span>
    </button>
  );
}

/**
 * Hook to check feature access
 */
export function useFeatureAccess(
  currentTier: ProfileTier,
  requiredTier: ProfileTier
): boolean {
  return tierLevel[currentTier] >= tierLevel[requiredTier];
}
