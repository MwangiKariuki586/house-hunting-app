// Homepage for VerifiedNyumba
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Key,
  TrendingUp,
  BadgeCheck,
  Users,
  MapPin,
  Phone,
  ArrowRight,
  Play,
  Star,
  Sparkles,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { PropertyCard } from "@/app/components/cards/PropertyCard";

// Placeholder featured properties
const featuredProperties = [
  {
    id: "1",
    title: "Luxury Modern Villa",
    area: "Westlands",
    estate: "Brookside Grove",
    propertyType: "THREE_BEDROOM",
    monthlyRent: 175000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2500,
    parking: true,
    parkingSpaces: 2,
    photos: [
      {
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        isMain: true,
      },
    ],
    isVerifiedLandlord: true,
  },
  {
    id: "2",
    title: "Cozy Lakeside Cabin",
    area: "Karen",
    estate: "Langata Road",
    propertyType: "TWO_BEDROOM",
    monthlyRent: 95000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1800,
    parking: true,
    parkingSpaces: 1,
    photos: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        isMain: true,
      },
    ],
    isVerifiedLandlord: true,
  },
  {
    id: "3",
    title: "Scandinavian Loft Home",
    area: "Kilimani",
    estate: "Rose Avenue",
    propertyType: "ONE_BEDROOM",
    monthlyRent: 65000,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 950,
    parking: true,
    photos: [
      {
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
        isMain: true,
      },
    ],
    isVerifiedLandlord: false,
  },
  {
    id: "4",
    title: "Smart Ridge House",
    area: "Lavington",
    estate: "Valley Arcade",
    propertyType: "FOUR_PLUS_BEDROOM",
    monthlyRent: 250000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 3200,
    parking: true,
    parkingSpaces: 3,
    photos: [
      {
        url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
        isMain: true,
      },
    ],
    isVerifiedLandlord: true,
  },
];

const services = [
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

const stats = [
  { value: "200+", label: "Properties Listed" },
  { value: "500+", label: "Happy Tenants" },
  { value: "50+", label: "Verified Landlords" },
  { value: "4.9", label: "Average Rating", icon: Star },
];

const whyChooseUs = [
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

export default function HomePage() {
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
              <Button
                size="xl"
                variant="outline"
                className="gap-2 border-white text-white hover:bg-white/10"
              >
                <Play className="h-5 w-5" />
                Watch Video
              </Button>
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

      {/* Property Rentals Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="mb-12 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
                Featured Listings
              </p>
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
                Property Rentals
              </h2>
              <p className="mt-3 max-w-xl text-gray-600">
                Explore our handpicked selection of verified properties across
                Nairobi&apos;s best neighborhoods.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm">
                Hot Deals
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600">
                All
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600">
                Price ↓
              </Button>
            </div>
          </div>

          {/* Property Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} {...property} variant="grid" />
            ))}
          </div>

          {/* View All Link */}
          <div className="mt-12 text-center">
            <Link href="/properties">
              <Button variant="outline" size="lg" className="gap-2">
                View All Properties
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

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

      {/* Why Choose Us Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            {/* Left - Image */}
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
                  alt="Modern interior"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Floating Stats Card */}
              <div className="absolute -bottom-8 -right-8 rounded-2xl bg-white p-6 shadow-xl lg:-right-12">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1B4D3E]">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">500+</p>
                    <p className="text-sm text-gray-500">Happy Clients</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
                About Us
              </p>
              <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">
                Why Choose{" "}
                <span className="text-[#1B4D3E]">VerifiedNyumba</span>
              </h2>
              <p className="mb-8 text-gray-600 leading-relaxed">
                We&apos;re not just another property listing site. We&apos;re
                building trust in Kenya&apos;s rental market by connecting
                tenants directly with verified landlords. No agents, no scams,
                just genuine homes.
              </p>

              <div className="grid gap-6 sm:grid-cols-2">
                {whyChooseUs.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#1B4D3E]/10">
                      <BadgeCheck className="h-5 w-5 text-[#1B4D3E]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link href="/about">
                  <Button size="lg" className="gap-2">
                    Learn More About Us
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Property Banner */}
      <section className="py-20 lg:py-28 bg-[#1B4D3E]">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left - Content */}
            <div className="text-white">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
                Featured Property
              </p>
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                Scandinavian Loft Home
              </h2>
              <p className="mb-6 text-gray-300 leading-relaxed">
                Experience modern living in this beautifully designed loft
                apartment featuring floor-to-ceiling windows, premium finishes,
                and a private balcony overlooking the city.
              </p>

              <div className="mb-8 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#D4A373]" />
                  <span>Kilimani, Nairobi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-[#D4A373]" />
                  <span>+254 700 000 000</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <p className="text-3xl font-bold">KES 65,000</p>
                  <p className="text-sm text-gray-400">per month</p>
                </div>
                <Link href="/properties/3">
                  <Button variant="accent" size="lg" className="gap-2">
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
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1B4D3E] to-[#2D6A4F] p-12 lg:p-20">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-pattern" />
            </div>

            <div className="relative text-center">
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                Are you a landlord?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-gray-200">
                List your property directly with us and connect with verified
                tenants. No agent fees, full control over your listings, and
                analytics to track performance.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/register?role=LANDLORD">
                  <Button
                    size="lg"
                    variant="accent"
                    className="gap-2 shadow-xl"
                  >
                    List Your Property
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


