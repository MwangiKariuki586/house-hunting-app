// Property detail page for VerifiedNyumba
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Car,
  Droplets,
  Zap,
  Heart,
  Share2,
  Flag,
  MessageSquare,
  Calendar,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Home,
  Shield,
  Users,
  PawPrint,
  Building2,
  Phone,
  TreePine,
  Waves,
  Dumbbell,
  Wifi,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import {
  formatPrice,
  formatDate,
  calculateMoveInCost,
  getInitials,
  propertyTypeLabels,
  buildingTypeLabels,
  waterTypeLabels,
  electricityTypeLabels,
} from "@/app/lib/utils";

interface Photo {
  id: string;
  url: string;
  isMain: boolean;
}

interface Landlord {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  verificationStatus: string;
  phone?: string;
  createdAt: string;
  _count: {
    listings: number;
  };
}

interface Listing {
  id: string;
  title: string;
  description: string;
  status: string;
  area: string;
  estate: string | null;
  landmark: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  distanceToCBD: number | null;
  distanceToStage: number | null;
  propertyType: string;
  buildingType: string;
  bedrooms: number;
  bathrooms: number;
  monthlyRent: number;
  deposit: number;
  serviceCharge: number;
  waterCharge: number;
  garbageCharge: number;
  waterType: string;
  electricityType: string;
  parking: boolean;
  parkingSpaces: number;
  petsAllowed: boolean;
  familyFriendly: boolean;
  bachelorFriendly: boolean;
  gatedCommunity: boolean;
  furnished: boolean;
  amenities: string[];
  photos: Photo[];
  landlord: Landlord;
  createdAt: string;
  viewCount: number;
}

const amenityIcons: Record<string, React.ElementType> = {
  garden: TreePine,
  pool: Waves,
  gym: Dumbbell,
  wifi: Wifi,
  parking: Car,
  security: Shield,
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [listing, setListing] = React.useState<Listing | null>(null);
  const [isSaved, setIsSaved] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [error, setError] = React.useState("");
  const [isPhoneRevealed, setIsPhoneRevealed] = React.useState(false);

  React.useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (res.ok) {
          const responseData = await res.json();
          if (responseData.success) {
            setListing(responseData.data.listing);
            setIsSaved(responseData.data.isSaved);
          } else {
             setListing(responseData.listing || null);
             setIsSaved(responseData.isSaved || false);
          }
        } else if (res.status === 404) {
          setError("Listing not found");
        }
      } catch {
        setError("Failed to load listing");
      } finally {
        setIsLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/listings/${id}/save`, {
        method: isSaved ? "DELETE" : "POST",
      });
      if (res.ok) {
        setIsSaved(!isSaved);
      } else if (res.status === 401) {
        router.push("/login");
      }
    } catch {
      console.error("Failed to save listing");
    }
  };

  const nextImage = () => {
    if (listing) {
      setCurrentImageIndex((prev) =>
        prev === listing.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? listing.photos.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B4D3E]" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {error || "Listing not found"}
        </h1>
        <Link href="/properties">
          <Button className="mt-4">Back to Properties</Button>
        </Link>
      </div>
    );
  }

  const moveInCost = calculateMoveInCost(listing);
  const isVerified = listing.landlord.verificationStatus === "VERIFIED";
  const location = listing.estate
    ? `${listing.estate}, ${listing.area}`
    : listing.area;

  return (
    <div className="pb-20">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-[#1B4D3E] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </button>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative aspect-16/10 w-full overflow-hidden rounded-3xl bg-gray-100">
              {listing.photos.length > 0 ? (
                <>
                  <Image
                    src={listing.photos[currentImageIndex].url}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    priority
                  />

                  {/* Image Navigation */}
                  {listing.photos.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg text-gray-800 hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg text-gray-800 hover:bg-white transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>

                      {/* Image Dots */}
                      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                        {listing.photos.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`h-2 w-8 rounded-full transition-colors ${
                              index === currentImageIndex
                                ? "bg-white"
                                : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Badges */}
                  <div className="absolute left-4 top-4 flex gap-2">
                    {isVerified && (
                      <Badge className="bg-[#1B4D3E] text-white gap-1 border-0 px-3 py-1.5">
                        <BadgeCheck className="h-4 w-4" />
                        Verified Landlord
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="absolute right-4 top-4 flex gap-2">
                    <button
                      onClick={handleSave}
                      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110 ${
                        isSaved ? "text-red-500" : "text-gray-600"
                      }`}
                    >
                      <Heart
                        className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`}
                      />
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg text-gray-600 hover:text-[#1B4D3E] transition-all hover:scale-110">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-gray-400">No images</span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {listing.photos.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {listing.photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl transition-all ${
                      index === currentImageIndex
                        ? "ring-2 ring-[#1B4D3E] ring-offset-2"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={photo.url}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Property Features Row */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
              <div className="flex flex-col items-center rounded-2xl bg-gray-50 p-4">
                <Bed className="mb-2 h-6 w-6 text-[#1B4D3E]" />
                <p className="text-lg font-bold text-gray-900">
                  {listing.bedrooms}
                </p>
                <p className="text-xs text-gray-500">Bedrooms</p>
              </div>
              <div className="flex flex-col items-center rounded-2xl bg-gray-50 p-4">
                <Bath className="mb-2 h-6 w-6 text-[#1B4D3E]" />
                <p className="text-lg font-bold text-gray-900">
                  {listing.bathrooms}
                </p>
                <p className="text-xs text-gray-500">Bathrooms</p>
              </div>
              <div className="flex flex-col items-center rounded-2xl bg-gray-50 p-4">
                <Maximize className="mb-2 h-6 w-6 text-[#1B4D3E]" />
                <p className="text-lg font-bold text-gray-900">1,200</p>
                <p className="text-xs text-gray-500">Sqft</p>
              </div>
              <div className="flex flex-col items-center rounded-2xl bg-gray-50 p-4">
                <Droplets className="mb-2 h-6 w-6 text-[#1B4D3E]" />
                <p className="text-sm font-bold text-gray-900">
                  {waterTypeLabels[listing.waterType]}
                </p>
                <p className="text-xs text-gray-500">Water</p>
              </div>
              <div className="flex flex-col items-center rounded-2xl bg-gray-50 p-4">
                <Zap className="mb-2 h-6 w-6 text-[#1B4D3E]" />
                <p className="text-sm font-bold text-gray-900">
                  {electricityTypeLabels[listing.electricityType]}
                </p>
                <p className="text-xs text-gray-500">Power</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            {/* Features Grid */}
            <div className="mt-10">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Features</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {listing.parking && (
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <Car className="h-5 w-5 text-[#1B4D3E]" />
                    <span className="text-sm">
                      Parking ({listing.parkingSpaces})
                    </span>
                  </div>
                )}
                {listing.petsAllowed && (
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <PawPrint className="h-5 w-5 text-[#1B4D3E]" />
                    <span className="text-sm">Pets Allowed</span>
                  </div>
                )}
                {listing.familyFriendly && (
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <Users className="h-5 w-5 text-[#1B4D3E]" />
                    <span className="text-sm">Family Friendly</span>
                  </div>
                )}
                {listing.bachelorFriendly && (
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <Home className="h-5 w-5 text-[#1B4D3E]" />
                    <span className="text-sm">Bachelor Friendly</span>
                  </div>
                )}
                {listing.gatedCommunity && (
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <Shield className="h-5 w-5 text-[#1B4D3E]" />
                    <span className="text-sm">Gated Community</span>
                  </div>
                )}
                {listing.furnished && (
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <Building2 className="h-5 w-5 text-[#1B4D3E]" />
                    <span className="text-sm">Furnished</span>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <div className="mt-10">
                <h2 className="mb-6 text-xl font-bold text-gray-900">
                  Amenities
                </h2>
                <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
                  {listing.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity.toLowerCase()] || Home;
                    return (
                      <div
                        key={amenity}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1B4D3E]/10">
                          <Icon className="h-7 w-7 text-[#1B4D3E]" />
                        </div>
                        <span className="text-xs text-center text-gray-600">
                          {amenity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Location</h2>
              <div className="rounded-2xl bg-gray-100 p-8 text-center">
                <MapPin className="mx-auto mb-4 h-12 w-12 text-[#1B4D3E]" />
                <p className="text-lg font-semibold text-gray-900">
                  {location}
                </p>
                {listing.landmark && (
                  <p className="text-gray-600">Near {listing.landmark}</p>
                )}
                {listing.distanceToCBD && (
                  <p className="mt-2 text-sm text-gray-500">
                    {listing.distanceToCBD} km to CBD
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Card */}
              <div className="rounded-3xl bg-white p-6 shadow-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Price Property</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <p className="text-3xl font-bold text-[#1B4D3E]">
                    {formatPrice(listing.monthlyRent)}
                  </p>
                  <span className="text-gray-500">/month</span>
                </div>

                <Button variant="accent" className="w-full mb-4" size="lg">
Schedule a Visit                </Button>

                {/* Property Type Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-[#1B4D3E]/10 text-[#1B4D3E] border-0">
                    {propertyTypeLabels[listing.propertyType]}
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-700 border-0">
                    {buildingTypeLabels[listing.buildingType]}
                  </Badge>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Deposit</span>
                    <span className="font-medium">
                      {formatPrice(listing.deposit)}
                    </span>
                  </div>
                  {listing.serviceCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service Charge</span>
                      <span className="font-medium">
                        {formatPrice(listing.serviceCharge)}
                      </span>
                    </div>
                  )}
                  {listing.waterCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Water</span>
                      <span className="font-medium">
                        {formatPrice(listing.waterCharge)}
                      </span>
                    </div>
                  )}
                  {listing.garbageCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Garbage</span>
                      <span className="font-medium">
                        {formatPrice(listing.garbageCharge)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-100 pt-3">
                    <span className="font-semibold text-gray-900">
                      Total Move-in
                    </span>
                    <span className="font-bold text-[#1B4D3E]">
                      {formatPrice(moveInCost)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Landlord Card */}
              <div className="rounded-3xl bg-white p-6 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16 border-2 border-[#1B4D3E]">
                    <AvatarImage src={listing.landlord.avatar || undefined} />
                    <AvatarFallback className="bg-[#1B4D3E] text-white">
                      {getInitials(
                        listing.landlord.firstName,
                        listing.landlord.lastName
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {listing.landlord.firstName} {listing.landlord.lastName}
                      </p>
                      {isVerified && (
                        <BadgeCheck className="h-5 w-5 text-[#1B4D3E]" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Property Owner</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button variant="default" className="w-full gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Send Message
                  </Button>
                  {/* <Button variant="outline" className="w-full gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule Viewing
                  </Button> */}
                  <Button
                    variant="ghost"
                    className="w-full gap-2 text-gray-600 hover:text-[#1B4D3E]"
                    onClick={() => setIsPhoneRevealed(!isPhoneRevealed)}
                  >
                    <Phone className="h-4 w-4" />
                    {isPhoneRevealed ? (
                      <a href={`tel:${listing.landlord.phone}`} className="font-bold underline">
                        {listing.landlord.phone}
                      </a>
                    ) : (
                      "Call Landlord"
                    )}
                  </Button>
                </div>
              </div>

              {/* Report */}
              <button className="flex w-full items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
                <Flag className="h-4 w-4" />
                Report this listing
              </button>

              {/* Stats */}
              <p className="text-center text-sm text-gray-400">
                {listing.viewCount} views • Listed{" "}
                {formatDate(listing.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


