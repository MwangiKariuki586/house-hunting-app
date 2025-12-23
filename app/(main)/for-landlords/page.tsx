/**
 * For Landlords Page
 *
 * A dedicated landing page for property owners/landlords explaining
 * the benefits of listing with VerifiedNyumba and how the platform works.
 */
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  Shield,
  ArrowRight,
  CheckCircle2,
  Building2,
  Zap,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";

// Benefits for landlords
const benefits = [
  {
    icon: Users,
    title: "Direct Tenant Connections",
    description:
      "Skip the agents and connect directly with verified tenants. No middlemen, no commissions, just genuine inquiries.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Landlord Badge",
    description:
      "Stand out from the crowd with our trust badge. Verified landlords get more inquiries and faster bookings.",
  },
  {
    icon: TrendingUp,
    title: "Listing Analytics",
    description:
      "Track property views, inquiry rates, and booking conversions. Make data-driven decisions to optimize your listings.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Set your available viewing slots once. Tenants book, you approve. No more back-and-forth phone calls.",
  },
  {
    icon: MessageSquare,
    title: "In-App Messaging",
    description:
      "Communicate with verified tenants through our secure messaging system. Share your number only when you're ready.",
  },
  {
    icon: Shield,
    title: "Scam Protection",
    description:
      "We verify tenant identities before they can contact you. Reduce time wasters and focus on serious inquiries.",
  },
];

// How it works steps
const howItWorks = [
  {
    step: "01",
    title: "Create Your Account",
    description:
      "Sign up as a landlord and complete a quick verification process. Once verified, you'll receive your trust badge.",
  },
  {
    step: "02",
    title: "List Your Property",
    description:
      "Add your property details, upload photos, set your price, and define available viewing slots. It takes less than 10 minutes.",
  },
  {
    step: "03",
    title: "Receive Inquiries",
    description:
      "Verified tenants will discover your listing, send messages, and book viewings. You control who you respond to.",
  },
  {
    step: "04",
    title: "Close the Deal",
    description:
      "Meet tenants, show your property, and finalize the rental agreement directly. Keep 100% of your rental income.",
  },
];

// Comparison with traditional agents
const comparison = [
  { feature: "Agent commission fees", traditional: "1-2 months rent", us: "Free" },
  { feature: "Time to find tenant", traditional: "2-4 weeks", us: "As fast as 3 days" },
  { feature: "Tenant verification", traditional: "Limited", us: "ID verified" },
  { feature: "Listing analytics", traditional: "None", us: "Full dashboard" },
  { feature: "Communication control", traditional: "Through agent", us: "Direct messaging" },
  { feature: "Viewing scheduling", traditional: "Manual", us: "Automated" },
];

// Stats
const stats = [
  { value: "50+", label: "Verified Landlords" },
  { value: "200+", label: "Properties Listed" },
  { value: "3 Days", label: "Avg. Time to First Inquiry" },
  { value: "0%", label: "Commission Fees" },
];

export default function ForLandlordsPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920"
            alt="Property owner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        </div>

        <div className="container relative mx-auto px-4 py-32 lg:py-40">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#D4A373]/20 px-4 py-2 text-[#D4A373] backdrop-blur-sm">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">For Property Owners</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              List Your Property,{" "}
              <span className="text-[#D4A373]">Keep Your Profits</span>
            </h1>

            <p className="mb-8 text-lg text-gray-200 md:text-xl">
              Join Kenya&apos;s premier verified property platform. Connect
              directly with quality tenants, skip the agent fees, and manage
              your rentals with ease.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/register?role=LANDLORD">
                <Button
                  size="xl"
                  variant="accent"
                  className="gap-2 shadow-xl shadow-[#D4A373]/30"
                >
                  Start Listing for Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="xl"
                variant="outline"
                className="gap-2 border-white text-white hover:bg-white/10"
              >
                Watch How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#1B4D3E] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-white md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
              Why List With Us
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-gray-600">
              From listing to lease signing, we provide all the tools you need
              to find quality tenants quickly and efficiently.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="group rounded-2xl bg-white p-8 shadow-sm border border-gray-100 transition-all hover:shadow-lg hover:border-[#1B4D3E]/20"
              >
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#1B4D3E]/10 text-[#1B4D3E] transition-colors group-hover:bg-[#1B4D3E] group-hover:text-white">
                  <benefit.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-28 bg-[#F9FAFB]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
              Getting Started
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-gray-600">
              List your property in minutes and start receiving inquiries from
              verified tenants.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="relative">
                {/* Connector line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-gray-200" />
                )}
                <div className="relative rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1B4D3E] text-white font-bold">
                    {step.step}
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/register?role=LANDLORD">
              <Button size="lg" className="gap-2">
                Get Started Now
                <Zap className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
              The Smart Choice
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              VerifiedNyumba vs Traditional Agents
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-gray-600">
              See why smart landlords are choosing to list directly with us.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
                <div className="p-4 font-semibold text-gray-900">Feature</div>
                <div className="p-4 font-semibold text-gray-500 text-center">
                  Traditional Agents
                </div>
                <div className="p-4 font-semibold text-[#1B4D3E] text-center bg-[#1B4D3E]/5">
                  VerifiedNyumba
                </div>
              </div>
              {/* Rows */}
              {comparison.map((row, index) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 ${
                    index < comparison.length - 1 ? "border-b border-gray-200" : ""
                  }`}
                >
                  <div className="p-4 text-gray-900">{row.feature}</div>
                  <div className="p-4 text-gray-500 text-center">
                    {row.traditional}
                  </div>
                  <div className="p-4 text-[#1B4D3E] text-center bg-[#1B4D3E]/5 font-medium flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {row.us}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial/Social Proof Section */}
      <section className="py-20 lg:py-28 bg-[#F9FAFB]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="h-6 w-6 text-[#D4A373] fill-[#D4A373]"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-2xl font-medium text-gray-900 md:text-3xl">
                &ldquo;I listed my property on VerifiedNyumba and got my first
                serious inquiry within 24 hours. The tenant was already
                verified, which saved me so much time.&rdquo;
              </blockquote>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="relative h-14 w-14 rounded-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                  alt="James Kimani"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">James Kimani</p>
                <p className="text-sm text-gray-500">
                  Property Owner, Kilimani
                </p>
              </div>
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
                Ready to List Your Property?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-gray-600">
                Join 50+ verified landlords who are already connecting with
                quality tenants on VerifiedNyumba. It&apos;s free to get
                started.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/register?role=LANDLORD">
                  <Button size="lg" className="gap-2">
                    Create Free Account
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">
                    Have Questions?
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
