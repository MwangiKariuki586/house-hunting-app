"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { PropertyCard } from "@/app/components/cards/PropertyCard";

export interface FeaturedListingType {
  id: string;
  title: string;
  area: string;
  estate?: string | null;
  propertyType: string;
  monthlyRent: number;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  parking?: boolean;
  photos: { url: string; isMain: boolean }[];
  isVerifiedLandlord?: boolean;
  viewCount: number;
  createdAt: Date;
}

interface FeaturedListingsProps {
  initialListings: FeaturedListingType[];
}

type FilterType = "all" | "hot" | "price_asc" | "price_desc";

export function FeaturedListings({ initialListings }: FeaturedListingsProps) {
  const [filter, setFilter] = useState<FilterType>("hot");

  const getFilteredListings = () => {
    let sorted = [...initialListings];

    switch (filter) {
      case "hot":
        // Sort by views (desc), then date (desc)
        sorted = sorted.sort((a, b) => {
          if (b.viewCount !== a.viewCount) return b.viewCount - a.viewCount;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
      case "price_asc":
        // Sort by price (asc)
        sorted = sorted.sort((a, b) => a.monthlyRent - b.monthlyRent);
        break;
      case "price_desc":
        // Sort by price (desc)
        sorted = sorted.sort((a, b) => b.monthlyRent - a.monthlyRent);
        break;
      case "all":
      default:
        // Default sort: Newest first
        sorted = sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return sorted.slice(0, 8); // Showing top 8 results
  };

  const filteredListings = getFilteredListings();

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#D4A373]">
              Featured Listings
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Property Rentals
            </h2>
            <p className="mt-3 max-w-xl text-gray-600">
              Explore our handpicked selection of verified properties across
              Nairobi&apos;s best neighborhoods.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            <Button
              variant={filter === "hot" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("hot")}
              className={filter !== "hot" ? "text-gray-600" : ""}
            >
              Hot Deals
            </Button>
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className={filter !== "all" ? "text-gray-600" : ""}
            >
              All
            </Button>
            <Button
              variant={filter.startsWith("price") ? "default" : "ghost"}
              size="sm"
              onClick={() =>
                setFilter(filter === "price_asc" ? "price_desc" : "price_asc")
              }
              className={!filter.startsWith("price") ? "text-gray-600" : ""}
            >
              Price {filter === "price_asc" ? "↑" : "↓"}
            </Button>
          </div>
        </div>

        {/* Property Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {filteredListings.map((property) => (
              <PropertyCard 
                key={property.id} 
                {...property} 
                variant="grid" 
                // Creating simplified sqft estimate if missing
                sqft={property.sqft || (property.bedrooms * 250 + 100)} 
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
            <p className="text-lg font-medium text-gray-900">
              No properties found based on current filters.
            </p>
            <p className="text-sm text-gray-500">
              Try adjusting your filters or check back later.
            </p>
          </div>
        )}

        {/* View All Link */}
        <div className="mt-12 text-center">
          <Link href="/properties">
            <Button variant="outline" size="lg" className="gap-2">
              View All Properties
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
