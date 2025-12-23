/**
 * Contact Us Page
 *
 * Allows users to get in touch with VerifiedNyumba through a contact form
 * or via direct contact information.
 */
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

// Contact information
const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@verifiednyumba.co.ke",
    href: "mailto:hello@verifiednyumba.co.ke",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+254 700 000 000",
    href: "tel:+254700000000",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Nairobi, Kenya",
    href: null,
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon - Fri, 9am - 6pm EAT",
    href: null,
  },
];

// FAQ items
const faqs = [
  {
    question: "How do I list my property?",
    answer:
      "Simply create an account as a landlord, complete the verification process, and you can start listing your properties immediately. The whole process takes less than 10 minutes.",
  },
  {
    question: "Is it free to list properties?",
    answer:
      "Yes! Listing your property on VerifiedNyumba is completely free. We don't charge any commission or listing fees.",
  },
  {
    question: "How does tenant verification work?",
    answer:
      "We verify tenant identities through ID verification before they can contact landlords. This ensures you only receive inquiries from genuine, verified individuals.",
  },
  {
    question: "How long does landlord verification take?",
    answer:
      "Landlord verification typically takes 24-48 hours. You'll need to provide valid identification and proof of property ownership or management rights.",
  },
  {
    question: "Can I edit my listing after publishing?",
    answer:
      "Yes, you can edit your listing at any time from your dashboard. Changes are reflected immediately on the platform.",
  },
];

// Inquiry types for the form
const inquiryTypes = [
  { value: "general", label: "General Inquiry" },
  { value: "landlord", label: "I'm a Landlord" },
  { value: "tenant", label: "I'm a Tenant" },
  { value: "partnership", label: "Partnership Opportunity" },
  { value: "support", label: "Technical Support" },
  { value: "feedback", label: "Feedback" },
];

export default function ContactPage() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      inquiryType: "",
      message: "",
    });
  };

  return (
    <div>
      {/* Hero Section with Image Banner */}
      <section className="relative min-h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920"
            alt="Contact us"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        <div className="container relative mx-auto px-4 py-32 lg:py-40">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-sm">
              <MessageSquare className="h-4 w-4 text-[#D4A373]" />
              <span className="text-sm font-medium">Get in Touch</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              We&apos;d Love to{" "}
              <span className="text-[#D4A373]">Hear From You</span>
            </h1>

            <p className="text-lg text-gray-200 md:text-xl">
              Have a question, feedback, or need assistance? Our team is here
              to help you every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h2>

              {submitted ? (
                <div className="rounded-2xl bg-[#1B4D3E]/5 border border-[#1B4D3E]/20 p-8 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#1B4D3E]/10">
                    <Send className="h-8 w-8 text-[#1B4D3E]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for reaching out. We&apos;ll get back to you
                    within 24 hours.
                  </p>
                  <Button onClick={() => setSubmitted(false)} variant="outline">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Input
                      label="Your Name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Input
                      label="Phone Number (Optional)"
                      type="tel"
                      placeholder="+254 700 000 000"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Inquiry Type
                      </label>
                      <Select
                        value={formData.inquiryType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, inquiryType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {inquiryTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Textarea
                    label="Your Message"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                    className="min-h-[150px]"
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="gap-2 w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Information
              </h2>

              <div className="space-y-6 mb-10">
                {contactInfo.map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#1B4D3E]/10">
                      <item.icon className="h-5 w-5 text-[#1B4D3E]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="font-medium text-gray-900 hover:text-[#1B4D3E] transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="font-medium text-gray-900">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div className="rounded-2xl bg-[#F9FAFB] border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="h-5 w-5 text-[#1B4D3E]" />
                  <h3 className="font-semibold text-gray-900">Quick Links</h3>
                </div>
                <div className="space-y-3">
                  <Link
                    href="/for-landlords"
                    className="block text-gray-600 hover:text-[#1B4D3E] transition-colors"
                  >
                    → I want to list my property
                  </Link>
                  <Link
                    href="/properties"
                    className="block text-gray-600 hover:text-[#1B4D3E] transition-colors"
                  >
                    → I&apos;m looking for a rental
                  </Link>
                  <Link
                    href="/about"
                    className="block text-gray-600 hover:text-[#1B4D3E] transition-colors"
                  >
                    → Learn more about us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28 bg-[#F9FAFB]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
                Common Questions
              </p>
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(openFaq === index ? null : index)
                    }
                    className="flex w-full items-center justify-between p-6 text-left"
                  >
                    <span className="font-semibold text-gray-900">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* <div className="mt-10 text-center">
              <p className="text-gray-600 mb-4">
                Still have questions? We&apos;re happy to help!
              </p>
              <a href="mailto:hello@verifiednyumba.co.ke">
                <Button variant="outline" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Email Us Directly
                </Button>
              </a>
            </div> */}
          </div>
        </div>
      </section>
    </div>
  );
}
