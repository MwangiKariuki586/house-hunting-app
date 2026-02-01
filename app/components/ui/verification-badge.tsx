// Verification Badge Component for VerifiedNyumba
// Displays landlord verification tier badges

"use client";

import * as React from "react";
import { Phone, CreditCard, CheckCircle2, Star } from "lucide-react";
import { cn } from "@/app/lib/utils";

export type BadgeTier = "BASIC" | "PHONE_VERIFIED" | "ID_VERIFIED" | "FULLY_VERIFIED";

interface VerificationBadgeProps {
  tier: BadgeTier;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const badgeConfig: Record<
  BadgeTier,
  {
    label: string;
    shortLabel: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ReactNode;
  }
> = {
  BASIC: {
    label: "Basic Account",
    shortLabel: "Basic",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
    icon: null,
  },
  PHONE_VERIFIED: {
    label: "Phone Verified",
    shortLabel: "Phone",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: <Phone className="h-3 w-3" />,
  },
  ID_VERIFIED: {
    label: "ID Verified",
    shortLabel: "ID",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: <CreditCard className="h-3 w-3" />,
  },
  FULLY_VERIFIED: {
    label: "Verified Landlord",
    shortLabel: "Verified",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    icon: <Star className="h-3 w-3 fill-amber-500" />,
  },
};

const sizeClasses = {
  sm: "px-1.5 py-0.5 text-xs gap-1",
  md: "px-2 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

/**
 * Displays a verification badge based on landlord's tier
 */
export function VerificationBadge({
  tier,
  size = "md",
  showLabel = true,
  className,
}: VerificationBadgeProps) {
  const config = badgeConfig[tier];

  // Don't show badge for BASIC tier
  if (tier === "BASIC") {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        sizeClasses[size],
        config.bgColor,
        config.borderColor,
        config.color,
        className
      )}
    >
      {config.icon}
      {showLabel && <span>{size === "sm" ? config.shortLabel : config.label}</span>}
    </span>
  );
}

/**
 * Compact badge showing just an icon with tooltip
 */
export function VerificationBadgeIcon({
  tier,
  className,
}: {
  tier: BadgeTier;
  className?: string;
}) {
  const config = badgeConfig[tier];

  if (tier === "BASIC" || !config.icon) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-full",
        config.bgColor,
        config.color,
        className
      )}
      title={config.label}
    >
      {config.icon}
    </span>
  );
}

/**
 * Full verification badge with checkmark for verified status
 */
export function VerifiedLandlordBadge({
  className,
}: {
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-linear-to-r from-amber-50 to-yellow-50 px-2.5 py-1 text-xs font-semibold text-amber-700",
        className
      )}
    >
      <CheckCircle2 className="h-3.5 w-3.5 fill-amber-500 text-white" />
      <span>Verified Landlord</span>
    </span>
  );
}
