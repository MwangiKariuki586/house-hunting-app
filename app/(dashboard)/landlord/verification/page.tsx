// Landlord Verification page for VerifiedNyumba
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/lib/utils";

type DocType = "ID" | "TITLE_DEED" | "UTILITY_BILL" | "CARETAKER_LETTER";

interface UploadedDoc {
  type: DocType;
  url: string;
  publicId: string;
}

interface VerificationStatus {
  status: "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED";
  documents: UploadedDoc[];
  note?: string;
}

const documentTypes: {
  type: DocType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    type: "ID",
    label: "National ID / Passport",
    description: "Clear photo of your ID (front and back) or passport",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    type: "TITLE_DEED",
    label: "Title Deed / Sale Agreement",
    description: "Property ownership document or sale agreement",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    type: "UTILITY_BILL",
    label: "Recent Utility Bill",
    description: "Electricity or water bill in your name (within 3 months)",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    type: "CARETAKER_LETTER",
    label: "Caretaker Authorization (Optional)",
    description: "Letter from property owner if you are a caretaker",
    icon: <FileText className="h-5 w-5" />,
  },
];

export default function LandlordVerificationPage() {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] =
    React.useState<VerificationStatus | null>(null);
  const [uploading, setUploading] = React.useState<DocType | null>(null);
  const [uploadedDocs, setUploadedDocs] = React.useState<UploadedDoc[]>([]);
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch current verification status
  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/landlord/verification");
        if (res.ok) {
          const data = await res.json();
          setVerificationStatus(data);
          setUploadedDocs(data.documents || []);
        }
      } catch {
        console.error("Failed to fetch verification status");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleFileUpload = async (type: DocType, file: File) => {
    if (!file) return;

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, WebP, and PDF files are allowed");
      return;
    }

    setError("");
    setUploading(type);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;

        const res = await fetch("/api/landlord/verification/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, file: base64 }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Upload failed");
          return;
        }

        const data = await res.json();
        setUploadedDocs((prev) => {
          // Replace if same type exists
          const filtered = prev.filter((doc) => doc.type !== type);
          return [
            ...filtered,
            { type, url: data.url, publicId: data.publicId },
          ];
        });
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveDoc = async (type: DocType) => {
    const doc = uploadedDocs.find((d) => d.type === type);
    if (!doc) return;

    try {
      await fetch("/api/landlord/verification/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: doc.publicId }),
      });

      setUploadedDocs((prev) => prev.filter((d) => d.type !== type));
    } catch {
      setError("Failed to remove document");
    }
  };

  const handleSubmitVerification = async () => {
    // Check required documents
    const hasId = uploadedDocs.some((d) => d.type === "ID");
    const hasOwnership = uploadedDocs.some(
      (d) =>
        d.type === "TITLE_DEED" ||
        d.type === "UTILITY_BILL" ||
        d.type === "CARETAKER_LETTER"
    );

    if (!hasId) {
      setError("Please upload your ID or passport");
      return;
    }

    if (!hasOwnership) {
      setError("Please upload at least one property ownership document");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/landlord/verification/submit", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Submission failed");
        return;
      }

      // Refresh the page to show new status
      router.refresh();
      setVerificationStatus((prev) =>
        prev ? { ...prev, status: "UNDER_REVIEW" } : null
      );
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDocUploaded = (type: DocType) =>
    uploadedDocs.some((d) => d.type === type);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // Already verified
  if (verificationStatus?.status === "VERIFIED") {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            You&apos;re Verified!
          </h2>
          <p className="mb-6 text-gray-600">
            Your landlord account has been verified. You can now list properties
            with the &quot;Verified Landlord&quot; badge.
          </p>
          <Button onClick={() => router.push("/dashboard/landlord/create")}>
            Create Your First Listing
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Under review
  if (verificationStatus?.status === "UNDER_REVIEW") {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Verification In Progress
          </h2>
          <p className="mb-6 text-gray-600">
            Your documents are being reviewed. This usually takes 24-48 hours.
            We&apos;ll notify you via email once the review is complete.
          </p>
          <Button variant="outline" onClick={() => router.push("/properties")}>
            Browse Properties
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Rejected - allow resubmission
  const isRejected = verificationStatus?.status === "REJECTED";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Landlord Verification
        </h1>
        <p className="mt-2 text-gray-600">
          Complete verification to get the &quot;Verified Landlord&quot; badge
          on your listings. This helps build trust with potential tenants.
        </p>
      </div>

      {isRejected && (
        <div className="mb-6 rounded-lg bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">
                Verification Rejected
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {verificationStatus?.note ||
                  "Your documents could not be verified. Please upload clearer documents and try again."}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {documentTypes.map((doc) => {
          const isUploaded = isDocUploaded(doc.type);
          const isUploading = uploading === doc.type;
          const isOptional = doc.type === "CARETAKER_LETTER";

          return (
            <Card
              key={doc.type}
              className={cn(
                "transition-colors",
                isUploaded && "border-green-200 bg-green-50/50"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        isUploaded
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {isUploaded ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        doc.icon
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {doc.label}
                        </h3>
                        {isOptional && (
                          <Badge variant="secondary" className="text-xs">
                            Optional
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {doc.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isUploaded && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                        onClick={() => handleRemoveDoc(doc.type)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <label className="cursor-pointer">
                      <Button
                        variant={isUploaded ? "outline" : "default"}
                        size="sm"
                        disabled={isUploading}
                        asChild
                      >
                        <span>
                          {isUploading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : isUploaded ? (
                            "Replace"
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Upload
                            </>
                          )}
                        </span>
                      </Button>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(doc.type, file);
                          e.target.value = "";
                        }}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Submit for Verification</CardTitle>
          <CardDescription>
            Make sure all required documents are uploaded before submitting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant={isDocUploaded("ID") ? "success" : "outline"}>
              {isDocUploaded("ID") ? "✓" : "○"} ID / Passport
            </Badge>
            <Badge
              variant={
                isDocUploaded("TITLE_DEED") ||
                isDocUploaded("UTILITY_BILL") ||
                isDocUploaded("CARETAKER_LETTER")
                  ? "success"
                  : "outline"
              }
            >
              {isDocUploaded("TITLE_DEED") ||
              isDocUploaded("UTILITY_BILL") ||
              isDocUploaded("CARETAKER_LETTER")
                ? "✓"
                : "○"}{" "}
              Property Proof
            </Badge>
          </div>

          <Button
            onClick={handleSubmitVerification}
            disabled={isSubmitting || uploadedDocs.length < 2}
            className="w-full"
            isLoading={isSubmitting}
          >
            Submit for Verification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}



