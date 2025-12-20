// About page for VerifiedNyumba
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Users,
  Building2,
  Target,
  Heart,
  Shield,
  MapPin,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";

const stats = [
  { value: "200+", label: "Properties Listed" },
  { value: "500+", label: "Happy Tenants" },
  { value: "50+", label: "Verified Landlords" },
  { value: "15+", label: "Nairobi Areas" },
];

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    description:
      "Every landlord is verified. Every listing is genuine. No hidden fees or surprises.",
  },
  {
    icon: Heart,
    title: "Client First",
    description:
      "Your satisfaction is our priority. We're here to help you find your perfect home.",
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
      "We personally verify listings to ensure accuracy and prevent scams.",
  },
];

const whyChooseUs = [
  {
    title: "Why VerifiedNyumba",
    description:
      "We understand the challenges of house hunting in Nairobi. That's why we built a platform that puts transparency and trust first.",
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
      "Every property on our platform goes through a verification process. We check landlord identity and property ownership.",
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
      "Our team knows Nairobi inside out. From Westlands to Kilimani, Karen to Kasarani, we've got you covered.",
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
      "We're not just a listing platform. Our dedicated team is here to support you throughout your house-hunting journey.",
    features: [
      "Dedicated support team",
      "Viewing coordination",
      "Negotiation assistance",
      "Move-in support",
    ],
  },
];

const team = [
  {
    name: "Sarah Wanjiku",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
  },
  {
    name: "James Ochieng",
    role: "Head of Operations",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  },
  {
    name: "Grace Muthoni",
    role: "Customer Success",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920"
            alt="Modern home interior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        <div className="container relative mx-auto px-4 py-32">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
              About Us
            </p>
            <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Helping You Find{" "}
              <span className="text-[#D4A373]">a Place to Belong</span>
            </h1>
            <p className="text-lg text-gray-200">
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
                  We decided to build something better. A platform where every
                  landlord is verified, every listing is genuine, and tenants
                  can find homes directly without middlemen taking a cut.
                </p>
                <p>
                  Today, we&apos;re proud to have helped hundreds of Kenyans
                  find their perfect homes. But we&apos;re just getting started.
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
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
                  alt="Modern home"
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
                    <p className="text-2xl font-bold text-gray-900">200+</p>
                    <p className="text-sm text-gray-500">Properties Listed</p>
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

      {/* Team Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
              Our Team
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Meet the Team
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="relative mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {member.name}
                </h3>
                <p className="text-sm text-gray-500">{member.role}</p>
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
