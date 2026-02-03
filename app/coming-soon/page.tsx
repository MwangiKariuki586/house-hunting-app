
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ArrowLeft, Rocket, Mail, Check } from "lucide-react";

export default function ComingSoonPage() {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubscribed, setIsSubscribed] = React.useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubscribed(true);
    setEmail("");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white selection:bg-teal-100 selection:text-teal-900">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-200/30 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-3xl opacity-50" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Logo / Brand */}
          <div className="mb-8 flex justify-center">
            <div className="rounded-2xl bg-teal-50 p-4 shadow-sm ring-1 ring-teal-100">
              <Rocket className="h-10 w-10 text-teal-600" />
            </div>
          </div>

          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-7xl">
          Coming Soon
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-gray-600">
            We are creating the most trusted marketplace for verified property rentals in Kenya. Stay tuned.
          </p>

          {/* Email Signup */}
          <div className="mx-auto max-w-md">
            {isSubscribed ? (
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-center animate-in fade-in zoom-in duration-300">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                  <Check className="h-5 w-5 text-teal-700" />
                </div>
                <h3 className="font-semibold text-teal-900">You're on the list!</h3>
                <p className="text-sm text-teal-700">
                  We'll notify you as soon as we launch.
                </p>
                <button 
                    onClick={() => setIsSubscribed(false)}
                    className="mt-2 text-xs text-teal-600 hover:text-teal-800 underline"
                >
                    Register another email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 h-12 rounded-xl border-gray-200 bg-white/80 backdrop-blur transition-all focus:border-teal-500 focus:ring-teal-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-12 rounded-xl bg-teal-800 px-8 font-semibold text-white transition-all hover:bg-teal-700 hover:shadow-lg disabled:opacity-70"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Joining..." : "Notify Me"}
                  </Button>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>

          {/* Footer / Links */}
          <div className="mt-16 flex items-center justify-center gap-6 text-sm font-medium text-gray-500">
            <Link
              href="/"
              className="group flex items-center gap-1 transition-colors underline hover:text-teal-600"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            
          </div>
        </div>
      </div>
    </div>
  );
}
