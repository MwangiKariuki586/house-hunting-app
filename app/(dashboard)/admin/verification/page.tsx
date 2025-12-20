// Admin Verification Review page for VerifiedNyumba
"use client";

import * as React from "react";
import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  AlertCircle,
  ExternalLink,
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
import { Textarea } from "@/app/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { formatDate } from "@/app/lib/utils";

interface VerificationDoc {
  id: string;
  type: string;
  url: string;
  uploadedAt: string;
}

interface PendingVerification {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  verificationDocs: VerificationDoc[];
}

export default function AdminVerificationPage() {
  const [verifications, setVerifications] = React.useState<
    PendingVerification[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [selectedUser, setSelectedUser] =
    React.useState<PendingVerification | null>(null);
  const [rejectionNote, setRejectionNote] = React.useState("");
  const [isRejecting, setIsRejecting] = React.useState(false);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = React.useState<VerificationDoc | null>(
    null
  );

  // Fetch pending verifications
  React.useEffect(() => {
    const fetchVerifications = async () => {
      try {
        const res = await fetch("/api/admin/verification");
        if (res.ok) {
          const data = await res.json();
          setVerifications(data.verifications);
        } else if (res.status === 403) {
          setError("You do not have permission to access this page");
        }
      } catch {
        setError("Failed to fetch verifications");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVerifications();
  }, []);

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    try {
      const res = await fetch("/api/admin/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "approve" }),
      });

      if (res.ok) {
        setVerifications((prev) => prev.filter((v) => v.id !== userId));
      } else {
        const data = await res.json();
        setError(data.error || "Failed to approve");
      }
    } catch {
      setError("Failed to approve verification");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedUser) return;

    setProcessingId(selectedUser.id);
    try {
      const res = await fetch("/api/admin/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: "reject",
          note: rejectionNote,
        }),
      });

      if (res.ok) {
        setVerifications((prev) =>
          prev.filter((v) => v.id !== selectedUser.id)
        );
        setSelectedUser(null);
        setRejectionNote("");
        setIsRejecting(false);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to reject");
      }
    } catch {
      setError("Failed to reject verification");
    } finally {
      setProcessingId(null);
    }
  };

  const getDocTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ID: "ID / Passport",
      TITLE_DEED: "Title Deed",
      UTILITY_BILL: "Utility Bill",
      CARETAKER_LETTER: "Caretaker Letter",
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error && error.includes("permission")) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Access Denied
          </h2>
          <p className="text-gray-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Verification Requests
        </h1>
        <p className="mt-2 text-gray-600">
          Review and process landlord verification requests.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {verifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <CheckCircle2 className="mb-4 h-12 w-12 text-green-500" />
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              All Caught Up!
            </h2>
            <p className="text-gray-600">No pending verification requests.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {verifications.map((verification) => (
            <Card key={verification.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {verification.firstName} {verification.lastName}
                    </CardTitle>
                    <CardDescription>
                      {verification.email} • {verification.phone}
                    </CardDescription>
                  </div>
                  <Badge variant="warning">Pending Review</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-gray-500">
                  Registered: {formatDate(verification.createdAt)}
                </p>

                {/* Documents */}
                <div className="mb-4">
                  <h4 className="mb-2 text-sm font-medium text-gray-700">
                    Submitted Documents
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {verification.verificationDocs.map((doc) => (
                      <Button
                        key={doc.id}
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewDoc(doc)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        {getDocTypeLabel(doc.type)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(verification.id)}
                    disabled={processingId === verification.id}
                    className="gap-2"
                  >
                    {processingId === verification.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedUser(verification);
                      setIsRejecting(true);
                    }}
                    disabled={processingId === verification.id}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rejection Dialog */}
      <Dialog open={isRejecting} onOpenChange={setIsRejecting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be shown to the
              landlord.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g., ID photo is blurry, please upload a clearer image"
            value={rejectionNote}
            onChange={(e) => setRejectionNote(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejecting(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionNote.trim() || processingId !== null}
            >
              {processingId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {previewDoc && getDocTypeLabel(previewDoc.type)}
            </DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
              {previewDoc.url.endsWith(".pdf") ? (
                <div className="flex h-full flex-col items-center justify-center gap-4">
                  <p className="text-gray-600">PDF Document</p>
                  <a
                    href={previewDoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-teal-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in new tab
                  </a>
                </div>
              ) : (
                <Image
                  src={previewDoc.url}
                  alt={previewDoc.type}
                  fill
                  className="object-contain"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

