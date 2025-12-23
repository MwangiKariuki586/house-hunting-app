/**
 * Homepage Constants
 * 
 * Static content used on the homepage including services, statistics,
 * and why-choose-us sections. These values are unlikely to change 
 * frequently and are separated here for maintainability.
 */

import { Key, Building2, TrendingUp, Star } from "lucide-react";
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
            "We offer an extensive selection of rental properties, including furnished and unfurnished options, across prime Nairobi locations.",
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
// Statistics Section
// ====================

export interface Stat {
    value: string;
    label: string;
    icon?: LucideIcon;
}

export const stats: Stat[] = [
    { value: "200+", label: "Properties Listed" },
    { value: "500+", label: "Happy Tenants" },
    { value: "50+", label: "Verified Landlords" },
    { value: "4.9", label: "Average Rating", icon: Star },
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
            "Deep knowledge of Nairobi neighborhoods, from Westlands to Kilimani to Karen.",
    },
    {
        title: "Client First",
        description:
            "Our dedicated team ensures you find the perfect home that matches your needs.",
    },
];
