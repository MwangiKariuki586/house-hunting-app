// Upgrade Prompt Modal for VerifiedNyumba
// Modal dialog encouraging profile tier upgrade

"use client";

import * as React from "react";
import Link from "next/link";
import { Phone, CreditCard, FileText, CheckCircle2, X, ArrowRight } from "lucide-react";
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

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: ProfileTier;
  requiredTier: ProfileTier;
  featureName: string;
  featureDescription?: string;
}

const tierInfo: Record<ProfileTier, {
  name: string;
  features: string[];
  action: string;
  icon: React.ReactNode;
  href: string;
}> = {
  BASIC: {
    name: "Basic Account",
    features: [],
    action: "Get started",
    icon: null,
    href: "/register",
  },
  PHONE_VERIFIED: {
    name: "Phone Verified",
    features: [
      "Create up to 5 listings",
      "View tenant phone numbers",
      "Basic analytics dashboard",
      "Phone Verified badge",
    ],
    action: "Verify your phone",
    icon: <Phone className="h-5 w-5" />,
    href: "/landlord/verification?step=phone",
  },
  ID_VERIFIED: {
    name: "ID Verified",
    features: [
      "Create up to 10 listings",
      "Mutual phone number reveal",
      "Full analytics dashboard",
      "Priority in search results",
      "1 free listing boost/month",
    ],
    action: "Upload your ID",
    icon: <CreditCard className="h-5 w-5" />,
    href: "/landlord/verification?step=id",
  },
  FULLY_VERIFIED: {
    name: "Fully Verified",
    features: [
      "Unlimited listings",
      "Featured listing eligibility",
      "3 free listing boosts/month",
      "Priority customer support",
      "Verified Landlord badge (Gold)",
    ],
    action: "Complete verification",
    icon: <FileText className="h-5 w-5" />,
    href: "/landlord/verification",
  },
};

/**
 * Modal dialog for upgrade prompts
 */
export function UpgradeModal({
  isOpen,
  onClose,
  currentTier,
  requiredTier,
  featureName,
  featureDescription,
}: UpgradeModalProps) {
  const info = tierInfo[requiredTier];

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <Card className="relative z-10 mx-4 w-full max-w-md shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader className="pb-2 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600">
            {info.icon || <CheckCircle2 className="h-6 w-6" />}
          </div>
          <CardTitle className="text-xl">
            Upgrade to {info.name}
          </CardTitle>
          <CardDescription>
            {featureDescription || `Unlock ${featureName} and more premium features`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Feature blocked message */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-800">
              <span className="font-medium">{featureName}</span> requires{" "}
              <span className="font-medium">{info.name}</span> status.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              What you&apos;ll unlock:
            </p>
            <ul className="space-y-2">
              {info.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Link href={info.href} onClick={onClose}>
              <Button className="w-full gap-2">
                {info.action}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" onClick={onClose} className="w-full">
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Hook to manage upgrade modal state
 */
export function useUpgradeModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [modalProps, setModalProps] = React.useState<{
    currentTier: ProfileTier;
    requiredTier: ProfileTier;
    featureName: string;
    featureDescription?: string;
  } | null>(null);

  const openModal = (props: {
    currentTier: ProfileTier;
    requiredTier: ProfileTier;
    featureName: string;
    featureDescription?: string;
  }) => {
    setModalProps(props);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalProps(null);
  };

  return {
    isOpen,
    modalProps,
    openModal,
    closeModal,
  };
}
