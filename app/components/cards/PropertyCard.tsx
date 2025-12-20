// Property Card component for VerifiedNyumba
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Bath, Maximize, Heart, BadgeCheck } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { cn, formatPrice } from "@/app/lib/utils";

interface PropertyCardProps {
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
  parkingSpaces?: number;
  photos: { url: string; isMain: boolean }[];
  isVerifiedLandlord?: boolean;
  isSaved?: boolean;
  onSave?: (id: string) => void;
  variant?: "grid" | "horizontal" | "featured";
  className?: string;
}

export function PropertyCard({
  id,
  title,
  area,
  estate,
  monthlyRent,
  bedrooms,
  bathrooms,
  sqft = 1200,
  photos,
  isVerifiedLandlord,
  isSaved,
  onSave,
  variant = "grid",
  className,
}: PropertyCardProps) {
  const mainPhoto = photos.find((p) => p.isMain) || photos[0];
  const location = estate ? `${estate}, ${area}` : area;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave?.(id);
  };

  // Grid variant - vertical card
  if (variant === "grid") {
    return (
      <Link
        href={`/properties/${id}`}
        className={cn(
          "group block overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 property-card",
          className
        )}
      >
        {/* Image container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {mainPhoto ? (
            <Image
              src={mainPhoto.url}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100">
              <span className="text-gray-400">No image</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Badges overlay */}
          {isVerifiedLandlord && (
            <div className="absolute left-3 top-3">
              <Badge className="bg-[#1B4D3E] text-white gap-1 border-0">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </Badge>
            </div>
          )}

          {/* Save button */}
          {onSave && (
            <button
              onClick={handleSaveClick}
              className={cn(
                "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-all hover:scale-110",
                isSaved ? "text-red-500" : "text-gray-600 hover:text-red-500"
              )}
            >
              <Heart className={cn("h-5 w-5", isSaved && "fill-current")} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-[#1B4D3E] transition-colors">
            {title}
          </h3>

          {/* Location */}
          <div className="mb-4 flex items-center text-sm text-gray-500">
            <MapPin className="mr-1.5 h-4 w-4 text-[#D4A373]" />
            <span className="line-clamp-1">{location}</span>
          </div>

          {/* Price */}
          <div className="mb-4">
            <p className="text-2xl font-bold text-[#1B4D3E]">
              {formatPrice(monthlyRent)}
            </p>
          </div>

          {/* Features */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-gray-400" />
                <span>{bedrooms}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-gray-400" />
                <span>{bathrooms}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4 text-gray-400" />
                <span>{sqft}</span>
              </div>
            </div>
            <Button size="sm" variant="accent">
              Contact
            </Button>
          </div>
        </div>
      </Link>
    );
  }

  // Horizontal variant - card with image on left
  if (variant === "horizontal") {
    return (
      <Link
        href={`/properties/${id}`}
        className={cn(
          "group flex overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 property-card",
          className
        )}
      >
        {/* Image container */}
        <div className="relative w-72 flex-shrink-0 overflow-hidden">
          {mainPhoto ? (
            <Image
              src={mainPhoto.url}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="300px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100">
              <span className="text-gray-400">No image</span>
            </div>
          )}

          {/* Badges overlay */}
          {isVerifiedLandlord && (
            <div className="absolute left-3 top-3">
              <Badge className="bg-[#1B4D3E] text-white gap-1 border-0">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            {/* Title */}
            <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-[#1B4D3E] transition-colors">
              {title}
            </h3>

            {/* Location */}
            <div className="mb-3 flex items-center text-sm text-gray-500">
              <MapPin className="mr-1.5 h-4 w-4 text-[#D4A373]" />
              <span className="line-clamp-1">{location}</span>
            </div>

            {/* Features */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-gray-400" />
                <span>{bedrooms} Beds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-gray-400" />
                <span>{bathrooms} Baths</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4 text-gray-400" />
                <span>{sqft} sqft</span>
              </div>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-2xl font-bold text-[#1B4D3E]">
              {formatPrice(monthlyRent)}
            </p>
            <Button size="sm" variant="accent">
              Contact
            </Button>
          </div>
        </div>

        {/* Save button */}
        {onSave && (
          <button
            onClick={handleSaveClick}
            className={cn(
              "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-all hover:scale-110",
              isSaved ? "text-red-500" : "text-gray-600 hover:text-red-500"
            )}
          >
            <Heart className={cn("h-5 w-5", isSaved && "fill-current")} />
          </button>
        )}
      </Link>
    );
  }

  // Featured variant - larger card
  return (
    <Link
      href={`/properties/${id}`}
      className={cn(
        "group relative overflow-hidden rounded-3xl bg-white shadow-xl property-card",
        className
      )}
    >
      {/* Image container */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {mainPhoto ? (
          <Image
            src={mainPhoto.url}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {/* Badge */}
          {isVerifiedLandlord && (
            <Badge className="mb-3 bg-[#1B4D3E] text-white gap-1 border-0">
              <BadgeCheck className="h-3 w-3" />
              Verified Landlord
            </Badge>
          )}

          {/* Title */}
          <h3 className="mb-2 text-2xl font-bold">{title}</h3>

          {/* Location */}
          <div className="mb-4 flex items-center text-sm text-gray-200">
            <MapPin className="mr-1.5 h-4 w-4" />
            <span>{location}</span>
          </div>

          {/* Features and Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5 text-sm">
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4" />
                <span>{bedrooms} Beds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" />
                <span>{bathrooms} Baths</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4" />
                <span>{sqft} sqft</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatPrice(monthlyRent)}</p>
              <p className="text-xs text-gray-300">per month</p>
            </div>
          </div>
        </div>

        {/* Save button */}
        {onSave && (
          <button
            onClick={handleSaveClick}
            className={cn(
              "absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110",
              isSaved ? "text-red-500" : "text-gray-600 hover:text-red-500"
            )}
          >
            <Heart className={cn("h-5 w-5", isSaved && "fill-current")} />
          </button>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="p-4">
        <Button variant="accent" className="w-full" size="lg">
          Explore Home
        </Button>
      </div>
    </Link>
  );
}
