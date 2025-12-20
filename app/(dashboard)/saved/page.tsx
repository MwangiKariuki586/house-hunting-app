// Saved listings page for VerifiedNyumba
"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { PropertyCard } from "@/app/components/cards/PropertyCard";

interface SavedListing {
  id: string;
  listing: {
    id: string;
    title: string;
    area: string;
    estate: string | null;
    propertyType: string;
    monthlyRent: number;
    bedrooms: number;
    bathrooms: number;
    parking: boolean;
    parkingSpaces: number;
    photos: { url: string; isMain: boolean }[];
    landlord: {
      verificationStatus: string;
    };
  };
}

export default function SavedListingsPage() {
  const [savedListings, setSavedListings] = React.useState<SavedListing[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await fetch("/api/user/saved");
        if (res.ok) {
          const data = await res.json();
          setSavedListings(data.saved);
        }
      } catch {
        console.error("Failed to fetch saved listings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const handleUnsave = async (listingId: string) => {
    try {
      const res = await fetch(`/api/listings/${listingId}/save`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSavedListings((prev) =>
          prev.filter((s) => s.listing.id !== listingId)
        );
      }
    } catch {
      console.error("Failed to unsave listing");
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Saved Properties</h1>
        <p className="mt-1 text-gray-600">
          Properties you&apos;ve saved for later
        </p>
      </div>

      {savedListings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Heart className="mb-4 h-12 w-12 text-gray-400" />
            <p className="text-lg font-medium text-gray-900">
              No saved properties yet
            </p>
            <p className="mt-2 text-gray-600">
              Save properties you like to easily find them later
            </p>
            <Link href="/properties">
              <Button className="mt-4">Browse Properties</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {savedListings.map(({ listing }) => (
            <PropertyCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              area={listing.area}
              estate={listing.estate}
              propertyType={listing.propertyType}
              monthlyRent={listing.monthlyRent}
              bedrooms={listing.bedrooms}
              bathrooms={listing.bathrooms}
              parking={listing.parking}
              parkingSpaces={listing.parkingSpaces}
              photos={listing.photos}
              isVerifiedLandlord={
                listing.landlord.verificationStatus === "VERIFIED"
              }
              isSaved={true}
              onSave={() => handleUnsave(listing.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

