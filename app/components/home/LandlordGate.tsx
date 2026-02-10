"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface LandlordGateProps {
  userRole?: string | null;
}

export function LandlordGate({ userRole }: LandlordGateProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleListProperty = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If user is logged in as a TENANT, block access
    if (userRole === "TENANT") {
      startTransition(() => {
        router.push("/access-denied");
      });
      return;
    }

    // Otherwise (Unauthenticated or LANDLORD), proceed to register/dashboard
    startTransition(() => {
      // If no role (guest), go to register as landlord. 
      // If already landlord (this component is on landing page, so likely guest), this link is fine.
      router.push("/register?role=LANDLORD");
    });
  };

  return (
    <Button 
      size="lg" 
      variant="swapFilled" 
      className="gap-2"
      onClick={handleListProperty}
      disabled={isPending}
    >
      {isPending ? "Redirecting..." : "List Your Property"}
      {!isPending && <ArrowRight className="h-4 w-4" />}
    </Button>
  );
}
