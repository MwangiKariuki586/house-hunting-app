// Services page for VerifiedNyumba
import Image from "next/image";
import Link from "next/link";
import {
  Key,
  Building2,
  TrendingUp,
  Home,
  Search,
  Shield,
  Users,
  BarChart3,
  MessageSquare,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";

const mainServices = [
  {
    icon: Key,
    title: "Property Rentals",
    description:
      "We offer an extensive selection of rental properties across Nairobi's prime locations. From cozy bedsitters to luxury apartments, find your perfect match.",
    features: [
      "Verified landlords only",
      "Transparent pricing",
      "In-app messaging",
      "Viewing scheduling",
    ],
  },
  {
    icon: Building2,
    title: "Property Management",
    description:
      "Let us handle the day-to-day operations of your rental property. From tenant screening to maintenance coordination, we've got you covered.",
    features: [
      "Tenant screening",
      "Rent collection",
      "Maintenance coordination",
      "Regular inspections",
    ],
  },
  {
    icon: TrendingUp,
    title: "Investment Advice",
    description:
      "Make informed decisions about your real estate investments. Our experts provide insights on market trends and investment opportunities.",
    features: [
      "Market analysis",
      "ROI projections",
      "Location insights",
      "Investment planning",
    ],
  },
];

const additionalServices = [
  {
    icon: Search,
    title: "Property Search",
    description: "Advanced filters to find exactly what you need",
  },
  {
    icon: Shield,
    title: "Verification",
    description: "Landlord and property verification services",
  },
  {
    icon: MessageSquare,
    title: "In-App Chat",
    description: "Secure messaging between tenants and landlords",
  },
  {
    icon: Calendar,
    title: "Viewing Scheduler",
    description: "Easy booking for property viewings",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Insights for landlords on listing performance",
  },
  {
    icon: Users,
    title: "Tenant Screening",
    description: "Background checks for peace of mind",
  },
];

const stats = [
  { icon: Home, value: "200+", label: "Properties Listed" },
  { icon: Users, value: "500+", label: "Happy Tenants" },
  { icon: Building2, value: "50+", label: "Verified Landlords" },
  { icon: BarChart3, value: "98%", label: "Satisfaction Rate" },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920"
            alt="Modern home"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        <div className="container relative mx-auto px-4 py-32">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
              Services
            </p>
            <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Our Services
            </h1>
            <p className="text-lg text-gray-200">
              Comprehensive real estate solutions tailored to the Kenyan market.
              From finding rentals to property management, we&apos;re here to
              help.
            </p>
          </div>
        </div>
      </section>

      {/* Main Services Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
              What We Offer
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Our Services
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {mainServices.map((service) => (
              <div
                key={service.title}
                className="group rounded-2xl bg-white p-8 shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:border-[#1B4D3E]/20"
              >
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1B4D3E]/10 text-[#1B4D3E] transition-colors group-hover:bg-[#1B4D3E] group-hover:text-white">
                  <service.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-xl font-semibold text-gray-900">
                  {service.title}
                </h3>
                <p className="mb-6 text-gray-600 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-3">
                  {service.features.map((feature) => (
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

      {/* Stats Section */}
      <section className="bg-[#1B4D3E] py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                  <stat.icon className="h-7 w-7 text-[#D4A373]" />
                </div>
                <p className="text-3xl font-bold text-white md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 lg:py-28 bg-[#F9FAFB]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
              Platform Features
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Additional Features
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {additionalServices.map((service) => (
              <div
                key={service.title}
                className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-sm border border-gray-100"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#1B4D3E]/10">
                  <service.icon className="h-6 w-6 text-[#1B4D3E]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {service.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Property + Contact Form */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left - Featured Property */}
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
                  alt="Featured property"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-sm text-[#D4A373] mb-2">
                    Featured Property
                  </p>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Scandinavian Loft Home
                  </h3>
                  <p className="text-gray-200 mb-4">Kilimani, Nairobi</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-white">
                      KES 65,000/mo
                    </p>
                    <Link href="/properties/3">
                      <Button variant="accent" className="gap-2">
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Contact Form */}
            <div className="rounded-3xl bg-white p-8 shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Let&apos;s Talk About You
              </h3>
              <p className="text-gray-600 mb-8">
                Have questions about our services? Get in touch with our team.
              </p>

              <form className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] outline-none"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] outline-none"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] outline-none"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] outline-none"
                    placeholder="+254 700 000 000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] outline-none resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="w-full"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Bar */}
      <section className="bg-[#1B4D3E] py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:justify-between">
            <div className="flex items-center gap-4 text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <Phone className="h-6 w-6 text-[#D4A373]" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Call us</p>
                <p className="font-semibold">+254 700 000 000</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <Mail className="h-6 w-6 text-[#D4A373]" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Email us</p>
                <p className="font-semibold">info@verifiednyumba.co.ke</p>
              </div>
            </div>

            <Link href="/properties">
              <Button variant="accent" size="lg" className="gap-2">
                Browse Properties
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


