"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X, ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/lib/utils";
import Link from "next/link";

type DocType = "TITLE_DEED" | "UTILITY_BILL" | "CARETAKER_LETTER";

interface UploadedDoc {
  type: string;
  url: string;
  publicId: string;
}

const docOptions: { type: DocType; label: string; description: string }[] = [
    { type: "TITLE_DEED", label: "Title Deed / Sale Agreement", description: "Proof of ownership." },
    { type: "UTILITY_BILL", label: "Utility Bill", description: "Recent electricity or water bill." },
    { type: "CARETAKER_LETTER", label: "Caretaker Letter", description: "Authorization letter from owner." },
];

export default function PropertyVerificationPage() {
  const router = useRouter();
  const [uploading, setUploading] = React.useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = React.useState<UploadedDoc[]>([]);
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/landlord/verification");
        if (res.ok) {
          const data = await res.json();
          setUploadedDocs(data.documents || []);
        }
      } catch {
        setError("Failed to fetch status");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleFileUpload = async (type: DocType, file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return setError("File too large (max 10MB)");

    setUploading(type);
    setError("");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch("/api/landlord/verification/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, file: base64 }),
        });

        if (!res.ok) throw new Error("Upload failed");
        
        const data = await res.json();
        setUploadedDocs(prev => [...prev.filter(d => d.type !== type), { type, url: data.url, publicId: data.publicId }]);
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async () => {
    const hasPropDoc = uploadedDocs.some(d => ["TITLE_DEED", "UTILITY_BILL", "CARETAKER_LETTER"].includes(d.type));
    if (!hasPropDoc) return setError("Please upload at least one document");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/landlord/verification/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "PROPERTY" }),
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

  const hasDoc = uploadedDocs.some(d => ["TITLE_DEED", "UTILITY_BILL", "CARETAKER_LETTER"].includes(d.type));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/landlord/verification" className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Verification
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Property Verification</h1>
        <p className="mt-2 text-gray-600">Upload documents to verify you own or manage the property. This unlocks Unlimited Listings.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="space-y-4">
        {docOptions.map(option => {
            const isUploaded = uploadedDocs.some(d => d.type === option.type);
            const isThisUploading = uploading === option.type;
            
            return (
                <Card key={option.type} className={cn("transition-colors", isUploaded && "border-green-200 bg-green-50/50")}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", isUploaded ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600")}>
                                    {isUploaded ? <CheckCircle2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">{option.label}</h3>
                                    <p className="text-sm text-gray-500">{option.description}</p>
                                </div>
                            </div>
                            <label className="cursor-pointer">
                                <Button variant={isUploaded ? "outline" : "default"} size="sm" disabled={!!uploading}>
                                    {isThisUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : isUploaded ? "Replace" : "Upload"}
                                </Button>
                                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && handleFileUpload(option.type, e.target.files[0])} disabled={!!uploading} />
                            </label>
                        </div>
                    </CardContent>
                </Card>
            );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={handleSubmit} disabled={!hasDoc || isSubmitting || !!uploading} isLoading={isSubmitting}>
          Submit for Property Verification
        </Button>
      </div>
    </div>
  );
}
