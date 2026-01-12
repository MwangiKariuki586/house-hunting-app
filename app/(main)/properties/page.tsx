// Properties listing page for VerifiedNyumba
"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  X,
  Loader2,
  Grid,
  List,
  SlidersHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { PropertyCard } from "@/app/components/cards/PropertyCard";
import { cn, propertyTypeLabels, buildingTypeLabels } from "@/app/lib/utils";
import { kenyanAreas } from "@/app/lib/validations/listing";

interface Listing {
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
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function PropertiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [listings, setListings] = React.useState<Listing[]>([]);
  const [pagination, setPagination] = React.useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showFilters, setShowFilters] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = React.useState(
    searchParams.get("page") ? Number(searchParams.get("page")) : 1
  );

  // Filter states
  const [area, setArea] = React.useState(searchParams.get("area") || "");
  const [propertyType, setPropertyType] = React.useState(
    searchParams.get("propertyType") || ""
  );
  const [buildingType, setBuildingType] = React.useState(
    searchParams.get("buildingType") || ""
  );
  const [minPrice, setMinPrice] = React.useState(
    searchParams.get("minPrice") || ""
  );
  const [maxPrice, setMaxPrice] = React.useState(
    searchParams.get("maxPrice") || ""
  );
  const [verifiedOnly, setVerifiedOnly] = React.useState(
    searchParams.get("verifiedLandlordOnly") === "true"
  );
  const [sortBy, setSortBy] = React.useState(
    searchParams.get("sortBy") || "newest"
  );

  // Feature filters
  const [parking, setParking] = React.useState(
    searchParams.get("parking") === "true"
  );
  const [petsAllowed, setPetsAllowed] = React.useState(
    searchParams.get("petsAllowed") === "true"
  );
  const [furnished, setFurnished] = React.useState(
    searchParams.get("furnished") === "true"
  );
  const [gatedCommunity, setGatedCommunity] = React.useState(
    searchParams.get("gatedCommunity") === "true"
  );

  const fetchListings = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (area) params.set("area", area);
      if (propertyType) params.set("propertyType", propertyType);
      if (buildingType) params.set("buildingType", buildingType);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (verifiedOnly) params.set("verifiedLandlordOnly", "true");
      if (parking) params.set("parking", "true");
      if (petsAllowed) params.set("petsAllowed", "true");
      if (furnished) params.set("furnished", "true");
      if (gatedCommunity) params.set("gatedCommunity", "true");
      params.set("sortBy", sortBy);
      params.set("page", currentPage.toString());

      const res = await fetch(`/api/listings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    area,
    propertyType,
    buildingType,
    minPrice,
    maxPrice,
    verifiedOnly,
    parking,
    petsAllowed,
    furnished,
    gatedCommunity,
    sortBy,
    currentPage,
  ]);

  React.useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [area, propertyType, buildingType, minPrice, maxPrice, verifiedOnly, parking, petsAllowed, furnished, gatedCommunity, sortBy]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (area) params.set("area", area);
    if (propertyType) params.set("propertyType", propertyType);
    if (buildingType) params.set("buildingType", buildingType);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (verifiedOnly) params.set("verifiedLandlordOnly", "true");
    if (parking) params.set("parking", "true");
    if (petsAllowed) params.set("petsAllowed", "true");
    if (furnished) params.set("furnished", "true");
    if (gatedCommunity) params.set("gatedCommunity", "true");
    params.set("sortBy", sortBy);

    router.push(`/properties?${params.toString()}`);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setArea("");
    setPropertyType("");
    setBuildingType("");
    setMinPrice("");
    setMaxPrice("");
    setVerifiedOnly(false);
    setParking(false);
    setPetsAllowed(false);
    setFurnished(false);
    setGatedCommunity(false);
    setSortBy("newest");
    router.push("/properties");
  };

  const activeFiltersCount = [
    area,
    propertyType,
    buildingType,
    minPrice,
    maxPrice,
    verifiedOnly,
    parking,
    petsAllowed,
    furnished,
    gatedCommunity,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#D4A373] mb-2">
                Browse Listings
              </p>
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
                Property Rentals
              </h1>
              <p className="mt-2 text-gray-600">
                {pagination?.total || 0} properties available
              </p>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant={sortBy === "newest" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("newest")}
                className={sortBy === "newest" ? "text-white" : ""}
              >
                Hot Deals
              </Button>
              <Button
                variant={sortBy === "price_low" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("price_low")}
                className={sortBy === "price_low" ? "text-white" : "text-gray-600"}
              >
                Price ↑
              </Button>
              <Button
                variant={sortBy === "price_high" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("price_high")}
                className={sortBy === "price_high" ? "text-white" : "text-gray-600"}
              >
                Price ↓
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block lg:w-72 flex-shrink-0">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#1B4D3E] hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <Select value={area || "all"} onValueChange={(val) => setArea(val === "all" ? "" : val)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="All areas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All areas</SelectItem>
                      {kenyanAreas.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <Select value={propertyType || "all"} onValueChange={(val) => setPropertyType(val === "all" ? "" : val)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {Object.entries(propertyTypeLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Building Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Building Type
                  </label>
                  <Select value={buildingType || "all"} onValueChange={(val) => setBuildingType(val === "all" ? "" : val)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="All buildings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All buildings</SelectItem>
                      {Object.entries(buildingTypeLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (KES)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="rounded-xl"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Features
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={verifiedOnly}
                        onCheckedChange={(checked) =>
                          setVerifiedOnly(checked as boolean)
                        }
                      />
                      <span className="text-sm">Verified landlords only</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={parking}
                        onCheckedChange={(checked) =>
                          setParking(checked as boolean)
                        }
                      />
                      <span className="text-sm">Parking</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={petsAllowed}
                        onCheckedChange={(checked) =>
                          setPetsAllowed(checked as boolean)
                        }
                      />
                      <span className="text-sm">Pets allowed</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={furnished}
                        onCheckedChange={(checked) =>
                          setFurnished(checked as boolean)
                        }
                      />
                      <span className="text-sm">Furnished</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={gatedCommunity}
                        onCheckedChange={(checked) =>
                          setGatedCommunity(checked as boolean)
                        }
                      />
                      <span className="text-sm">Gated community</span>
                    </label>
                  </div>
                </div>

                <Button
                  onClick={applyFilters}
                  className="w-full"
                  variant="accent"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button & View Toggle */}
            <div className="flex items-center justify-between mb-6 lg:justify-end">
              <Button
                variant="outline"
                className="lg:hidden gap-2"
                onClick={() => setShowFilters(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1B4D3E] text-xs text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              {/* View Toggle */}
              <div className="flex items-center gap-1 rounded-xl bg-white p-1 border border-gray-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "rounded-lg p-2 transition-colors",
                    viewMode === "grid"
                      ? "bg-[#1B4D3E] text-white"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "rounded-lg p-2 transition-colors",
                    viewMode === "list"
                      ? "bg-[#1B4D3E] text-white"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#1B4D3E]" />
              </div>
            ) : listings.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-gray-100">
                <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters to find more results
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "grid gap-6",
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1"
                  )}
                >
                  {listings.map((listing) => (
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
                      variant={viewMode === "grid" ? "grid" : "horizontal"}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        )}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      {/* Page Numbers - Show 3 pages centered around current */}
                      {(() => {
                        const totalPages = pagination.pages;
                        let startPage = Math.max(1, currentPage - 1);
                        let endPage = Math.min(totalPages, startPage + 2);
                        
                        // Adjust if we're near the end
                        if (endPage - startPage < 2) {
                          startPage = Math.max(1, endPage - 2);
                        }
                        
                        const pages = [];
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(i);
                        }
                        
                        return pages.map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              "h-10 w-10 rounded-xl text-sm font-medium transition-colors",
                              page === currentPage
                                ? "bg-[#1B4D3E] text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                            )}
                          >
                            {page}
                          </button>
                        ));
                      })()}

                      {/* Next Button */}
                      <button
                        onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                        disabled={currentPage === pagination.pages}
                        className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                          currentPage === pagination.pages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        )}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Select value={area || "all"} onValueChange={(val) => setArea(val === "all" ? "" : val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="All areas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All areas</SelectItem>
                    {kenyanAreas.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <Select value={propertyType || "all"} onValueChange={(val) => setPropertyType(val === "all" ? "" : val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {Object.entries(propertyTypeLabels).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (KES)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="rounded-xl"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Features
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={verifiedOnly}
                      onCheckedChange={(checked) =>
                        setVerifiedOnly(checked as boolean)
                      }
                    />
                    <span className="text-sm">Verified only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={parking}
                      onCheckedChange={(checked) =>
                        setParking(checked as boolean)
                      }
                    />
                    <span className="text-sm">Parking</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={petsAllowed}
                      onCheckedChange={(checked) =>
                        setPetsAllowed(checked as boolean)
                      }
                    />
                    <span className="text-sm">Pets allowed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={furnished}
                      onCheckedChange={(checked) =>
                        setFurnished(checked as boolean)
                      }
                    />
                    <span className="text-sm">Furnished</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={clearFilters}
                >
                  Clear All
                </Button>
                <Button
                  variant="accent"
                  className="flex-1"
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


