// About page for VerifiedNyumba
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  Target,
  Heart,
  Shield,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";

const stats = [
  { value: "24", label: "Market-informed rentals" },
  { value: "18", label: "At KES 25K or less" },
  { value: "16", label: "Localities represented" },
  { value: "4", label: "Metro counties" },
];

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    description:
      "Show rent, deposits, recurring charges, and move-in costs clearly so homes are easier to compare.",
  },
  {
    icon: Heart,
    title: "Client First",
    description:
      "Build the search around the practical questions Kenyan tenants ask before arranging a viewing.",
  },
  {
    icon: Target,
    title: "Local Expertise",
    description:
      "Deep knowledge of Nairobi neighborhoods helps us match you with the right property.",
  },
  {
    icon: BadgeCheck,
    title: "Quality Assurance",
    description:
      "Give property owners a structured way to provide useful, property-specific information.",
  },
];

const whyChooseUs = [
  {
    title: "Why VerifiedNyumba",
    description:
      "We understand the challenges of house hunting in Nairobi. That is why the platform puts transparent costs and useful local detail first.",
    features: [
      "Direct landlord connections",
      "Verified property listings",
      "No agent commissions",
      "Transparent pricing",
    ],
  },
  {
    title: "Our Promise",
    description:
      "The product is being built to support landlord identity and property checks before public launch.",
    features: [
      "ID verification for landlords",
      "Property ownership proof",
      "Accurate listing photos",
      "Real-time availability",
    ],
  },
  {
    title: "Local Expertise",
    description:
      "The first catalogue focuses on Nairobi and its main commuter towns, with market-informed price bands by locality.",
    features: [
      "Neighborhood guides",
      "Price insights by area",
      "Transport accessibility info",
      "Local amenities mapping",
    ],
  },
  {
    title: "Client First Approach",
    description:
      "Each listing prioritises the information that affects everyday renting and moving costs.",
    features: [
      "Dedicated support team",
      "Viewing coordination",
      "Negotiation assistance",
      "Move-in support",
    ],
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-kenyan-rentals.webp"
            alt="Rental apartments in Nairobi Metro"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        <div className="container relative mx-auto px-4 py-32 lg:py-40">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-sm">
              <Building2 className="h-4 w-4 text-[#D4A373]" />
              <span className="text-sm font-medium">About Us</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              Helping You Find{" "}
              <span className="text-[#D4A373]">a Place to Belong</span>
            </h1>

            <p className="text-lg text-gray-200 md:text-xl">
              We&apos;re on a mission to transform Kenya&apos;s rental market by
              connecting tenants directly with verified landlords.
            </p>
          </div>
        </div>
      </section>

      {/* About Story Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            {/* Left - Content */}
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
                Our Story
              </p>
              <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">
                About Story
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  VerifiedNyumba was born from a simple frustration: the chaos
                  and distrust in Kenya&apos;s rental market. Too many fake
                  listings, agent abuse, and hidden fees made house hunting a
                  nightmare.
                </p>
                <p>
                  We decided to build something better: a platform designed for
                  clear costs, locally relevant details, and direct contact
                  between tenants and property owners.
                </p>
                <p>
                  The current private prototype starts with 24 market-informed
                  Nairobi Metro rentals so the experience can be tested before
                  genuine landlord submissions replace them.
                </p>
              </div>

              <div className="mt-10">
                <Link href="/properties">
                  <Button size="lg" className="gap-2">
                    Browse Properties
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image
                  src="/images/demo-listings/githurai-44-single-room-1.webp"
                  alt="Everyday rental apartments in Githurai"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Floating Stats Card */}
              <div className="absolute -bottom-8 -left-8 rounded-2xl bg-white p-6 shadow-xl lg:-left-12">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1B4D3E]">
                    <Building2 className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">24</p>
                    <p className="text-sm text-gray-500">Market-informed rentals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Grid */}
      <section className="bg-[#F9FAFB] py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
              Why Us
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Why Choose Us
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {whyChooseUs.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100"
              >
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mb-6 text-gray-600">{item.description}</p>
                <ul className="space-y-3">
                  {item.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-gray-700"
                    >
                      <CheckCircle2 className="h-5 w-5 text-[#1B4D3E]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
              Our Values
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              What We Stand For
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1B4D3E]/10">
                  <value.icon className="h-8 w-8 text-[#1B4D3E]" />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#1B4D3E] py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-white md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-[#F9FAFB]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Ready to Find Your Home?
            </h2>
            <p className="mb-8 text-gray-600">
              Browse our verified listings and find your perfect rental property
              today.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/properties">
                <Button size="lg" variant="accent" className="gap-2">
                  Browse Properties
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


