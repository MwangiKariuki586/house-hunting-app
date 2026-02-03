"use client";

import * as React from "react";  
import { useRouter } from "next/navigation";
import { Smartphone, CheckCircle2, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import Link from "next/link";

export default function PhoneVerificationPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<"INPUT" | "OTP">("INPUT");
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Fetch current user phone
  React.useEffect(() => {
    fetch("/api/user/profile")
      .then(res => res.json())
      .then(data => {
        if (data.phone) setPhone(data.phone);
        if (data.phoneVerified) setStep("INPUT"); // Or handle already verified
      });
  }, []);

  const handleSendCode = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", phoneNumber: phone }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setStep("OTP");
        // For dev convenience, maybe show toast with code?
        alert("Dev Mode: Your code is 123456"); 
      } else {
        setError(data.error || "Failed to send code");
      }
    } catch {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", code }),
      });
      
      if (res.ok) {
        router.push("/landlord/verification");
      } else {
        const data = await res.json();
        setError(data.error || "Invalid code");
      }
    } catch {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="mb-6">
        <Link href="/landlord/verification" className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Verification
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Phone Verification</h1>
        <p className="mt-2 text-gray-600">Verify your phone number to start creating listings.</p>
      </div>

      <Card>
        <CardHeader>
           <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                <Smartphone className="h-6 w-6" />
           </div>
           <CardTitle>{step === "INPUT" ? "Enter Phone Number" : "Enter Code"}</CardTitle>
           <CardDescription>
             {step === "INPUT" 
                ? "We'll send you a 6-digit verification code." 
                : `Enter the code sent to ${phone}`
             }
           </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
            
            {step === "INPUT" ? (
                <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium leading-none">Phone Number</label>
                    <Input 
                        id="phone" 
                        placeholder="+254 7..." 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)}
                    />
                </div>
            ) : (
                <div className="space-y-2">
                    <label htmlFor="code" className="text-sm font-medium leading-none">Verification Code</label>
                    <Input 
                        id="code" 
                        placeholder="123456" 
                        value={code} 
                        onChange={e => setCode(e.target.value)}
                        className="text-center text-2xl tracking-widest"
                        maxLength={6}
                    />
                </div>
            )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
             {step === "INPUT" ? (
                <Button className="w-full" onClick={handleSendCode} disabled={isLoading || !phone}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Send Code
                </Button>
             ) : (
                <>
                <Button className="w-full" onClick={handleVerify} disabled={isLoading || code.length < 6}>
                     {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                     Verify
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setStep("INPUT")}>
                    Change Phone Number
                </Button>
                </>
             )}
        </CardFooter>
      </Card>
    </div>
  );
}
