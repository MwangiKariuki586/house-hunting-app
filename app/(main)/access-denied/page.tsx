"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 rounded-full bg-red-50 p-6">
        <ShieldAlert className="h-12 w-12 text-red-500" />
      </div>
      
      <h1 className="mb-4 text-3xl font-bold text-gray-900">
        Landlord Access Only
      </h1>
      
      <p className="mb-8 max-w-md text-gray-600">
        This section is reserved for verified landlords. As a registered tenant, 
        you can browse properties but cannot list them.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href="/">
          <Button variant="default" size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Link href="/contact">
          <Button variant="outline" size="lg">
            Contact Support
          </Button>
        </Link>
      </div>
    </div>
  );
}
