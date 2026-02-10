// Homepage for VerifiedNyumba
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Users,
  MapPin,
  Phone,
  ArrowRight,
  Play,
  Sparkles,
  Building2,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { PropertyCard } from "@/app/components/cards/PropertyCard";

import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { FeaturedListings } from "@/app/components/home/FeaturedListings";
import { LandlordGate } from "@/app/components/home/LandlordGate";

// Import data from centralized data files
import {
  services,
  stats,
  whyChooseUs,
} from "@/app/lib/data";

export default async function HomePage() {
  const currentUser = await getCurrentUser();
  
  // Fetch real featured listings (top 12 active ones)
  const listingsData = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      viewCount: "desc", // Default to most viewed for "featured"
    },
    take: 12,
    include: {
      photos: true,
      landlord: {
        include: {
          landlordVerification: true,
        },
      },
    },
  });

  // Map to component interface
  const listings = listingsData.map((listing) => ({
    id: listing.id,
    title: listing.title,
    area: listing.area,
    estate: listing.estate,
    propertyType: listing.propertyType,
    monthlyRent: listing.monthlyRent,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    // sqft not in DB, calculated in component or omitted
    parking: listing.parking,
    photos: listing.photos.map(p => ({ url: p.url, isMain: p.isMain })),
    isVerifiedLandlord: listing.landlord.landlordVerification?.status === "VERIFIED",
    viewCount: listing.viewCount,
    createdAt: listing.createdAt,
  }));

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[700px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920"
            alt="Beautiful modern home"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="container relative mx-auto px-4 py-32 lg:py-40">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-[#D4A373]" />
              <span className="text-sm">
                Kenya&apos;s #1 Verified Property Platform
              </span>
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              Helping You Find{" "}
              <span className="text-[#D4A373]">a Place to Belong</span>
            </h1>

            <p className="mb-8 text-lg text-gray-200 md:text-xl">
              Discover verified rental properties directly from landlords. No
              agents, no hidden fees, just your perfect home waiting for you.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/properties">
                <Button
                  size="xl"
                  variant="accent"
                  className="gap-2 shadow-xl shadow-[#1B4D3E]/30"
                >
                  Browse Properties
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              {/* <Button
                size="xl"
                variant="outline"
                className="gap-2 border-white text-white hover:bg-white/10"
              >
                <Play className="h-5 w-5" />
                Watch Video
              </Button> */}
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <div className="flex items-center justify-center gap-1 sm:justify-start">
                    <p className="text-3xl font-bold text-white">
                      {stat.value}
                    </p>
                    {stat.icon && (
                      <stat.icon className="h-5 w-5 text-[#D4A373] fill-[#D4A373]" />
                    )}
                  </div>
                  <p className="text-sm text-gray-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Property Rentals Section with Featured Listings */}
      <FeaturedListings initialListings={listings} />

      {/* Services Section */}
      <section className="bg-[#F9FAFB] py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
              What We Offer
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Our Services
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="group rounded-2xl bg-white p-8 shadow-sm border border-gray-100 transition-all hover:shadow-lg hover:border-[#1B4D3E]/20"
              >
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#1B4D3E]/10 text-[#1B4D3E] transition-colors group-hover:bg-[#1B4D3E] group-hover:text-white">
                  <service.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Two-Column Layout for Tenants & Landlords */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
              Why Choose Us
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Built for <span className="text-[#1B4D3E]">Everyone</span>
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-gray-600">
              Whether you&apos;re searching for your next home or looking to
              list your property, VerifiedNyumba has you covered.
            </p>
          </div>

          {/* Two-Column Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* For Tenants Column */}
            <div className="flex flex-col rounded-3xl border border-gray-200 bg-white p-8 lg:p-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#1B4D3E]/10 px-4 py-2 self-start">
                <Users className="h-4 w-4 text-[#1B4D3E]" />
                <span className="text-sm font-medium text-[#1B4D3E]">
                  For Tenants
                </span>
              </div>

              <h3 className="mb-4 text-2xl font-bold text-gray-900">
                Find Your Perfect Home
              </h3>
              <p className="mb-8 text-gray-600">
                Browse verified properties, connect directly with landlords, and
                skip the agent fees.
              </p>

              <div className="flex-1 space-y-5">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#1B4D3E]/10">
                    <BadgeCheck className="h-5 w-5 text-[#1B4D3E]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Verified Listings
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Every property is verified for authenticity and accuracy.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#1B4D3E]/10">
                    <BadgeCheck className="h-5 w-5 text-[#1B4D3E]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      No Agent Fees
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Connect directly with landlords. No middlemen required.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#1B4D3E]/10">
                    <BadgeCheck className="h-5 w-5 text-[#1B4D3E]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Local Expertise
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Deep knowledge of Nairobi neighborhoods and pricing.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#1B4D3E]/10">
                    <BadgeCheck className="h-5 w-5 text-[#1B4D3E]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Client First
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Dedicated support to help you find your perfect home.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/properties">
                  <Button size="lg" variant="swapFilled" className="gap-2">
                    Browse Properties
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="swapOutline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            {/* For Landlords Column */}
            <div className="flex flex-col rounded-3xl border border-gray-200 bg-[#F9FAFB] p-8 lg:p-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#D4A373]/10 px-4 py-2 self-start">
                <Building2 className="h-4 w-4 text-[#D4A373]" />
                <span className="text-sm font-medium text-[#D4A373]">
                  For Landlords
                </span>
              </div>

              <h3 className="mb-4 text-2xl font-bold text-gray-900">
                List & Earn More
              </h3>
              <p className="mb-8 text-gray-600">
                Connect directly with quality tenants, manage your listings with
                ease, and keep 100% of your rental income.
              </p>

              <div className="flex-1 space-y-5">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#D4A373]/10">
                    <BadgeCheck className="h-5 w-5 text-[#D4A373]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Verified Badge
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Stand out with a trust badge that attracts quality tenants.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#D4A373]/10">
                    <Users className="h-5 w-5 text-[#D4A373]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Direct Connections
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Chat directly with tenants. No middlemen, no agent fees.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#D4A373]/10">
                    <MapPin className="h-5 w-5 text-[#D4A373]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Easy Scheduling
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Built-in viewing slots. Tenants book, you approve.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#D4A373]/10">
                    <Sparkles className="h-5 w-5 text-[#D4A373]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Listing Analytics
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Track views, inquiries, and bookings in real-time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <LandlordGate userRole={currentUser?.role} />
                <Link href="/for-landlords">
                  <Button size="lg" variant="swapOutline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Property Banner */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left - Content */}
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
                Featured Property
              </p>
              <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">
                Scandinavian Loft Home
              </h2>
              <p className="mb-6 text-gray-600 leading-relaxed">
                Experience modern living in this beautifully designed loft
                apartment featuring floor-to-ceiling windows, premium finishes,
                and a private balcony overlooking the city.
              </p>

              <div className="mb-8 flex items-center gap-6 text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#1B4D3E]" />
                  <span>Kilimani, Nairobi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-[#1B4D3E]" />
                  <span>+254 700 000 000</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900">KES 65,000</p>
                  <p className="text-sm text-gray-500">per month</p>
                </div>
                <Link href="/properties/3">
                  <Button size="lg" className="gap-2">
                    Explore Home
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
                alt="Scandinavian Loft Home"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-[#F9FAFB] p-12 lg:p-20">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Ready to get started?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-gray-600">
                Whether you&apos;re looking for your next home or want to list
                your property, VerifiedNyumba makes it easy.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/properties">
                  <Button size="lg" className="gap-2">
                    Browse Properties
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <LandlordGate userRole={currentUser?.role} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
