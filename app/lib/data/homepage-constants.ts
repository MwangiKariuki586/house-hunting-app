/**
 * Homepage Constants
 * 
 * Static content used on the homepage including services, statistics,
 * and why-choose-us sections. These values are unlikely to change 
 * frequently and are separated here for maintainability.
 */

import { Key, Building2, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ====================
// Services Section
// ====================

export interface Service {
    icon: LucideIcon;
    title: string;
    description: string;
}

export const services: Service[] = [
    {
        icon: Key,
        title: "Property Rentals",
        description:
            "Browse practical rental options across Nairobi and surrounding commuter towns, with costs and local details shown clearly.",
    },
    {
        icon: Building2,
        title: "Property Management",
        description:
            "VerifiedNyumba offers comprehensive property management services to take the stress out of landlord duties.",
    },
    {
        icon: TrendingUp,
        title: "Investment Advice",
        description:
            "The Kenyan real estate market offers numerous opportunities. Get expert advice on where and when to invest.",
    },
];

// ====================
// Why Choose Us Section
// ====================

export interface WhyChooseUsItem {
    title: string;
    description: string;
}

export const whyChooseUs: WhyChooseUsItem[] = [
    {
        title: "Verified Listings",
        description:
            "Every landlord is verified with ID and property ownership proof. No fake listings.",
    },
    {
        title: "No Agent Fees",
        description:
            "Connect directly with property owners. No middlemen, no surprise commissions.",
    },
    {
        title: "Local Expertise",
        description:
            "Useful local detail across Nairobi and surrounding commuter towns, including water and transport access.",
    },
    {
        title: "Client First",
        description:
            "Compare rent, deposits, recurring charges, water arrangements, and transport access before making an inquiry.",
    },
];
