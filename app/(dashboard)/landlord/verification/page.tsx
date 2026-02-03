"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck, Home, UserCheck, Lock, Smartphone } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/lib/utils";

interface VerificationState {
  status: string;
  note?: string;
  idVerified: boolean;
  propertyOwnerVerified: boolean;
  profileTier: string;
  phoneVerified: boolean;
}

export default function LandlordVerificationHub() {
  const router = useRouter();
  const [data, setData] = React.useState<VerificationState | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // ... (fetch logic remains same)
    const fetchStatus = async () => {
        try {
          const res = await fetch("/api/landlord/verification");
          if (res.ok) {
            const json = await res.json();
            setData(json);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };
      fetchStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const isUnderReview = data?.status === "UNDER_REVIEW";
  // Determine specific review context if possible from note
  const reviewScope = data?.note?.startsWith("Review Scope: ") 
    ? data.note.replace("Review Scope: ", "") 
    : "FULL";

  const isIdReview = isUnderReview && (reviewScope === "IDENTITY" || reviewScope === "FULL");
  const isPropReview = isUnderReview && (reviewScope === "PROPERTY" || reviewScope === "FULL");

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Verification Center</h1>
        <p className="mt-2 text-lg text-gray-600">
          Complete verification steps to unlock higher listing limits and build trust.
        </p>
      </div>

      {/* Status Banner */}
      {data?.status === "REJECTED" && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-100">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Verification Rejected</h3>
              <p className="mt-1 text-sm text-red-700">{data.note || "Please review your documents and try again."}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tier Progress */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Step 1: Phone */}
        <Card className={cn("relative overflow-hidden transition-all flex flex-col h-full", data?.phoneVerified ? "border-green-200 bg-green-50/30" : "border-gray-200")}>
          <div className="absolute top-0 right-0 p-4">
             {data?.phoneVerified ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Verified</Badge>
             ) : (
                <Badge variant="outline">Step 1</Badge>
             )}
          </div>
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <Smartphone className="h-6 w-6" />
            </div>
            <CardTitle>Phone Verification</CardTitle>
            <CardDescription>Required for listing creation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 flex-1">
             <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Create up to 5 listings</span>
                </li>
                <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Basic Analytics</span>
                </li>
             </ul>
          </CardContent>
          <CardFooter>
             {data?.phoneVerified ? (
                <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800" disabled>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Completed
                </Button>
             ) : (
                <Button 
                    className="w-full" 
                    onClick={() => router.push("/landlord/verification/phone")}
                >
                   Verify Phone <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
             )}
          </CardFooter>
        </Card>

        {/* Step 2: Identity */}
        <Card className={cn("relative overflow-hidden transition-all flex flex-col h-full", data?.idVerified ? "border-green-200 bg-green-50/30" : "border-gray-200")}>
          <div className="absolute top-0 right-0 p-4">
             {data?.idVerified ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Verified</Badge>
             ) : isIdReview ? (
                <Badge variant="outline" className="animate-pulse border-blue-200 bg-blue-50 text-blue-700">Under Review</Badge>
             ) : (
                <Badge variant="outline">Step 2</Badge>
             )}
          </div>
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <UserCheck className="h-6 w-6" />
            </div>
            <CardTitle>Identity Verification</CardTitle>
            <CardDescription>Required for higher limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 flex-1">
             <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Create up to 10 listings</span>
                </li>
                <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Reveal tenant phone numbers</span>
                </li>
                <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>"ID Verified" Badge</span>
                </li>
             </ul>
          </CardContent>
          <CardFooter>
             {data?.idVerified ? (
                <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800" disabled>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Completed
                </Button>
             ) : (
                <Button 
                    variant={data?.phoneVerified ? "default" : "secondary"}
                    className="w-full" 
                    onClick={() => router.push("/landlord/verification/identity")}
                    disabled={isIdReview || !data?.phoneVerified}
                >
                    {isIdReview ? "In Review..." : !data?.phoneVerified ? "Verify Phone First" : "Verify Identity"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
             )}
          </CardFooter>
        </Card>

        {/* Step 3: Property */}
        <Card className={cn("relative overflow-hidden transition-all flex flex-col h-full", data?.propertyOwnerVerified ? "border-green-200 bg-green-50/30" : "border-gray-200")}>
           <div className="absolute top-0 right-0 p-4">
             {data?.propertyOwnerVerified ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Verified</Badge>
             ) : isPropReview ? (
                <Badge variant="outline" className="animate-pulse border-blue-200 bg-blue-50 text-blue-700">Under Review</Badge>
             ) : (
                <Badge variant="outline">Step 3</Badge>
             )}
          </div>
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                <Home className="h-6 w-6" />
            </div>
            <CardTitle>Property Verification</CardTitle>
            <CardDescription>Prove ownership to unlock everything</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 flex-1">
             <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Unlimited Listings</span>
                </li>
                <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Priority Search Ranking</span>
                </li>
                <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>"Verified Landlord" Badge</span>
                </li>
             </ul>
          </CardContent>
          <CardFooter>
            {data?.propertyOwnerVerified ? (
                <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800" disabled>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Completed
                </Button>
             ) : (
                <Button 
                    variant={data?.idVerified ? "default" : "secondary"}
                    className="w-full" 
                    onClick={() => router.push("/landlord/verification/property")}
                    disabled={isPropReview || !data?.idVerified} 
                >
                    {isPropReview ? "In Review..." : !data?.idVerified ? "Verify Identity First" : "Verify Property"} 
                    {!isPropReview && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
             )}
          </CardFooter>
        </Card>
      </div>

      {/* Summary Section */}
      <Card className="bg-gray-900 text-white">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center md:flex-row md:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/10">
                <ShieldCheck className="h-8 w-8 text-teal-400" />
            </div>
            <div className="flex-1">
                <h2 className="text-xl font-semibold">Why verify?</h2>
                <p className="mt-2 text-gray-300">
                    Verified landlords get 3x more inquiries. Verification builds trust with tenants and unlocks premium features.
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
