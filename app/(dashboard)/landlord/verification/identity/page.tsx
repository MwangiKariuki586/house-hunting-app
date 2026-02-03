"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload, CreditCard, CheckCircle2, AlertCircle, Loader2, X, ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/lib/utils";
import Link from "next/link";

type DocType = "ID";

interface UploadedDoc {
  type: string;
  url: string;
  publicId: string;
}

export default function IdentityVerificationPage() {
  const router = useRouter();
  const [uploading, setUploading] = React.useState<boolean>(false);
  const [uploadedDocs, setUploadedDocs] = React.useState<UploadedDoc[]>([]);
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch current documents
  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/landlord/verification");
        if (res.ok) {
          const data = await res.json();
          // Filter only ID docs
          setUploadedDocs(data.documents.filter((d: any) => d.type === "ID") || []);
          
          if (data.idVerified) {
             // Redirect if already verified? Or just show status
             // For now, let's allow them to stay or redirect back
          }
        }
      } catch {
        setError("Failed to fetch status");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch("/api/landlord/verification/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "ID", file: base64 }),
        });

        if (!res.ok) throw new Error("Upload failed");
        
        const data = await res.json();
        setUploadedDocs(prev => [...prev.filter(d => d.type !== "ID"), { type: "ID", url: data.url, publicId: data.publicId }]);
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (uploadedDocs.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/landlord/verification/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "IDENTITY" }),
      });
      
      if (res.ok) {
        router.push("/landlord/verification");
      } else {
        const data = await res.json();
        setError(data.error || "Submission failed");
      }
    } catch {
      setError("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-600" /></div>;

  const isUploaded = uploadedDocs.some(d => d.type === "ID");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/landlord/verification" className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Verification
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Identity Verification</h1>
        <p className="mt-2 text-gray-600">Upload your National ID or Passport to unlock verified features.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <Card className={cn("transition-colors", isUploaded && "border-green-200 bg-green-50/50")}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-lg", isUploaded ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600")}>
                {isUploaded ? <CheckCircle2 className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">National ID / Passport</h3>
                <p className="mt-1 text-sm text-gray-500">Upload a clear photo of your ID (front/back) or Passport bio page.</p>
              </div>
            </div>
            
            <label className="cursor-pointer">
              <Button variant={isUploaded ? "outline" : "default"} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : isUploaded ? "Replace" : "Upload"}
              </Button>
              <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} disabled={uploading} />
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={handleSubmit} disabled={!isUploaded || isSubmitting || uploading} isLoading={isSubmitting}>
          Submit for Identity Verification
        </Button>
      </div>
    </div>
  );
}
