// Profile tier utility functions for VerifiedNyumba
// Handles incremental landlord verification and feature gating

import { ProfileTier } from "@prisma/client";

/**
 * User verification data needed for tier calculations
 */
export interface UserVerificationData {
    emailVerified: boolean;
    phoneVerified: boolean;
    idVerified: boolean;
    propertyOwnerVerified: boolean;
    // No changes needed here actually, as this interface describes the SHAPE of data needed, not the storage persistence.
    // The previous files like auth.ts verify this shape is returned.
    verificationStatus: "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED";
}

/**
 * Features that can be gated by profile tier
 */
export type GatedFeature =
    | "CREATE_LISTING"
    | "PHONE_REVEAL_VIEW"
    | "PHONE_REVEAL_MUTUAL"
    | "ANALYTICS_BASIC"
    | "ANALYTICS_FULL"
    | "PRIORITY_SEARCH"
    | "LISTING_BOOST"
    | "PREMIUM_SUPPORT"
    | "FEATURED_LISTING";

/**
 * Listing limits per tier
 */
export const LISTING_LIMITS: Record<ProfileTier, number> = {
    BASIC: 2,
    PHONE_VERIFIED: 5,
    ID_VERIFIED: 10,
    FULLY_VERIFIED: Infinity, // Unlimited
};

/**
 * Calculate profile completeness percentage based on verification steps
 * 
 * Breakdown:
 * - Email verified: 15%
 * - Phone verified: 15%
 * - ID verified: 35%
 * - Property ownership verified: 35%
 */
export function calculateProfileCompleteness(user: UserVerificationData): number {
    let completeness = 0;

    if (user.emailVerified) completeness += 15;
    if (user.phoneVerified) completeness += 15;
    if (user.idVerified) completeness += 35;
    if (user.propertyOwnerVerified) completeness += 35;

    return completeness;
}

/**
 * Determine user's current profile tier based on verification status
 */
export function getProfileTier(user: UserVerificationData): ProfileTier {
    // Fully verified = all documents verified
    if (user.idVerified && user.propertyOwnerVerified) {
        return "FULLY_VERIFIED";
    }

    // ID verified = ID document verified
    if (user.idVerified) {
        return "ID_VERIFIED";
    }

    // Phone verified = phone number verified
    if (user.phoneVerified) {
        return "PHONE_VERIFIED";
    }

    // Basic = no verification
    return "BASIC";
}

/**
 * Check if user can access a specific feature based on their tier
 */
export function canAccessFeature(
    tier: ProfileTier,
    feature: GatedFeature
): boolean {
    const tierLevel = getTierLevel(tier);

    switch (feature) {
        case "CREATE_LISTING":
            // Requires at least phone verification
            return tierLevel >= getTierLevel("PHONE_VERIFIED");

        case "PHONE_REVEAL_VIEW":
            // Landlord can see tenant phone with phone verification
            return tierLevel >= getTierLevel("PHONE_VERIFIED");

        case "PHONE_REVEAL_MUTUAL":
            // Mutual phone reveal requires ID verification
            return tierLevel >= getTierLevel("ID_VERIFIED");

        case "ANALYTICS_BASIC":
            return tierLevel >= getTierLevel("PHONE_VERIFIED");

        case "ANALYTICS_FULL":
            return tierLevel >= getTierLevel("ID_VERIFIED");

        case "PRIORITY_SEARCH":
            return tierLevel >= getTierLevel("ID_VERIFIED");

        case "LISTING_BOOST":
            return tierLevel >= getTierLevel("ID_VERIFIED");

        case "FEATURED_LISTING":
            return tierLevel >= getTierLevel("FULLY_VERIFIED");

        case "PREMIUM_SUPPORT":
            return tierLevel >= getTierLevel("FULLY_VERIFIED");

        default:
            return false;
    }
}

/**
 * Get numeric tier level for comparison
 */
function getTierLevel(tier: ProfileTier): number {
    switch (tier) {
        case "BASIC":
            return 0;
        case "PHONE_VERIFIED":
            return 1;
        case "ID_VERIFIED":
            return 2;
        case "FULLY_VERIFIED":
            return 3;
        default:
            return 0;
    }
}

/**
 * Get listing limit for a given tier
 */
export function getListingLimit(tier: ProfileTier): number {
    return LISTING_LIMITS[tier];
}

/**
 * Check if user can create more listings
 */
export function canCreateListing(
    tier: ProfileTier,
    currentListingCount: number
): { allowed: boolean; reason?: string; limit: number } {
    const limit = getListingLimit(tier);

    // Check if user can create listings at all
    if (!canAccessFeature(tier, "CREATE_LISTING")) {
        return {
            allowed: false,
            reason: "Please verify your phone number to create listings.",
            limit: 0,
        };
    }

    // Check listing count limit
    if (currentListingCount >= limit) {
        return {
            allowed: false,
            reason: `You've reached the maximum of ${limit} listings for your tier. Upgrade to create more.`,
            limit,
        };
    }

    return { allowed: true, limit };
}

/**
 * Get badge info for a tier
 */
export interface TierBadge {
    label: string;
    color: "gray" | "blue" | "green" | "gold";
    icon: "none" | "phone" | "id" | "verified" | "star";
}

export function getTierBadge(tier: ProfileTier): TierBadge {
    switch (tier) {
        case "BASIC":
            return { label: "Basic", color: "gray", icon: "none" };
        case "PHONE_VERIFIED":
            return { label: "Phone Verified", color: "blue", icon: "phone" };
        case "ID_VERIFIED":
            return { label: "ID Verified", color: "green", icon: "id" };
        case "FULLY_VERIFIED":
            return { label: "Verified Landlord", color: "gold", icon: "star" };
        default:
            return { label: "Basic", color: "gray", icon: "none" };
    }
}

/**
 * Get next steps for profile completion
 */
export interface NextStep {
    action: string;
    description: string;
    percentageGain: number;
    priority: number;
}

export function getNextSteps(user: UserVerificationData): NextStep[] {
    const steps: NextStep[] = [];

    if (!user.emailVerified) {
        steps.push({
            action: "VERIFY_EMAIL",
            description: "Verify your email address",
            percentageGain: 15,
            priority: 1,
        });
    }

    if (!user.phoneVerified) {
        steps.push({
            action: "VERIFY_PHONE",
            description: "Verify your phone number",
            percentageGain: 15,
            priority: 2,
        });
    }

    if (!user.idVerified) {
        steps.push({
            action: "UPLOAD_ID",
            description: "Upload your National ID or Passport",
            percentageGain: 35,
            priority: 3,
        });
    }

    if (!user.propertyOwnerVerified) {
        steps.push({
            action: "VERIFY_PROPERTY",
            description: "Upload property ownership documents",
            percentageGain: 35,
            priority: 4,
        });
    }

    return steps.sort((a, b) => a.priority - b.priority);
}

/**
 * Get features unlocked at each tier
 */
export function getTierFeatures(tier: ProfileTier): string[] {
    switch (tier) {
        case "BASIC":
            return [
                "Browse all listings",
                "Save favorite properties",
                "In-app messaging",
            ];
        case "PHONE_VERIFIED":
            return [
                "Create up to 5 listings",
                "View tenant phone numbers",
                "Basic analytics dashboard",
                "Phone Verified badge",
            ];
        case "ID_VERIFIED":
            return [
                "Create up to 10 listings",
                "Mutual phone number reveal",
                "Full analytics dashboard",
                "Priority in search results",
                "1 free listing boost/month",
                "ID Verified badge",
            ];
        case "FULLY_VERIFIED":
            return [
                "Unlimited listings",
                "Featured listing eligibility",
                "3 free listing boosts/month",
                "Priority customer support",
                "Verified Landlord badge (Gold)",
                "Property Owner badge",
            ];
        default:
            return [];
    }
}
