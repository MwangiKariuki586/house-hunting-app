// Landlord Listings Management page for VerifiedNyumba
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Eye,
  Edit2,
  Pause,
  Play,
  Trash2,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Card, CardContent } from "@/app/components/ui/card";
import { formatPrice, formatDate, propertyTypeLabels } from "@/app/lib/utils";

interface ListingPhoto {
  url: string;
  isMain: boolean;
}

interface Listing {
  id: string;
  title: string;
  area: string;
  propertyType: string;
  monthlyRent: number;
  status: "ACTIVE" | "PAUSED" | "TAKEN" | "DELETED";
  viewCount: number;
  photos: ListingPhoto[];
  createdAt: string;
  _count: {
    conversations: number;
  };
}

export default function LandlordListingsPage() {
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch("/api/landlord/listings");
        if (res.ok) {
          const data = await res.json();
          setListings(data.listings);
        }
      } catch {
        console.error("Failed to fetch listings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchListings();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setListings((prev) =>
          prev.map((l) =>
            l.id === id ? { ...l, status: status as Listing["status"] } : l
          )
        );
      }
    } catch {
      console.error("Failed to update status");
    }
  };

  const deleteListing = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== id));
      }
    } catch {
      console.error("Failed to delete listing");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Active</Badge>;
      case "PAUSED":
        return <Badge variant="warning">Paused</Badge>;
      case "TAKEN":
        return <Badge variant="secondary">Taken</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="mt-1 text-gray-600">Manage your property listings</p>
        </div>
        <Link href="/dashboard/landlord/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Listing
          </Button>
        </Link>
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <p className="text-lg font-medium text-gray-900">No listings yet</p>
            <p className="mt-2 text-gray-600">
              Create your first listing to start receiving inquiries
            </p>
            <Link href="/dashboard/landlord/create">
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create Listing
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg">
                    {listing.photos[0] ? (
                      <Image
                        src={listing.photos[0].url}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-100">
                        <span className="text-xs text-gray-400">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/properties/${listing.id}`}
                          className="font-semibold text-gray-900 hover:text-teal-600"
                        >
                          {listing.title}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {listing.area} •{" "}
                          {propertyTypeLabels[listing.propertyType]}
                        </p>
                      </div>
                      {getStatusBadge(listing.status)}
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-semibold text-teal-600">
                        {formatPrice(listing.monthlyRent)}/mo
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {listing.viewCount} views
                      </span>
                      <span>
                        {listing._count.conversations} inquiry
                        {listing._count.conversations !== 1 ? "ies" : "y"}
                      </span>
                      <span className="text-gray-400">
                        Listed {formatDate(listing.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/properties/${listing.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/landlord/edit/${listing.id}`}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {listing.status === "ACTIVE" ? (
                        <DropdownMenuItem
                          onClick={() => updateStatus(listing.id, "PAUSED")}
                        >
                          <Pause className="mr-2 h-4 w-4" />
                          Pause Listing
                        </DropdownMenuItem>
                      ) : listing.status === "PAUSED" ? (
                        <DropdownMenuItem
                          onClick={() => updateStatus(listing.id, "ACTIVE")}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Reactivate
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem
                        onClick={() => updateStatus(listing.id, "TAKEN")}
                      >
                        Mark as Taken
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => deleteListing(listing.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

