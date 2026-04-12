// Landlord Analytics Dashboard for VerifiedNyumba
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  MessageSquare,
  Heart,
  Star,
  Calendar,
  TrendingUp,
  Building2,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { formatPrice, formatRelativeTime, getInitials } from "@/app/lib/utils";

interface Analytics {
  overview: {
    totalListings: number;
    totalViews: number;
    totalInquiries: number;
    totalSaves: number;
    avgRating: number;
    statusBreakdown: {
      active: number;
      paused: number;
      taken: number;
    };
  };
  topListings: {
    id: string;
    title: string;
    area: string;
    views: number;
    inquiries: number;
    saves: number;
    monthlyRent: number;
    photo: string | null;
  }[];
  recentConversations: {
    id: string;
    tenant: {
      firstName: string;
      lastName: string;
      avatar: string | null;
    };
    listing: string;
    lastMessage: string | null;
    updatedAt: string;
  }[];
  upcomingViewings: {
    id: string;
    tenant: {
      firstName: string;
      lastName: string;
    };
    listing: string;
    date: string;
    time: string;
    status: string;
  }[];
  recentReviews: {
    id: string;
    reviewer: {
      firstName: string;
      lastName: string;
      avatar: string | null;
    };
    rating: number;
    comment: string | null;
    createdAt: string;
  }[];
}

export default function LandlordAnalyticsPage() {
  const [analytics, setAnalytics] = React.useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/landlord/analytics");
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch {
        console.error("Failed to fetch analytics");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Overview of your listings performance
          </p>
        </div>
        <Link href="/landlord/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Listing
          </Button>
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Listings
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.overview.totalListings}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                <Building2 className="h-6 w-6 text-teal-600" />
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-green-600">
                {analytics.overview.statusBreakdown.active} active
              </span>
              <span className="text-yellow-600">
                {analytics.overview.statusBreakdown.paused} paused
              </span>
              <span className="text-gray-500">
                {analytics.overview.statusBreakdown.taken} taken
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.overview.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Inquiries</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.overview.totalInquiries}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Saved</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.overview.totalSaves}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
            </div>
            {analytics.overview.avgRating > 0 && (
              <div className="mt-4 flex items-center gap-1 text-sm text-yellow-600">
                <Star className="h-4 w-4 fill-current" />
                {analytics.overview.avgRating} avg rating
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Top Performing Listings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              Top Listings
            </CardTitle>
            <Link href="/landlord/listings">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {analytics.topListings.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No listings yet. Create your first listing!
              </p>
            ) : (
              <div className="space-y-4">
                {analytics.topListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/properties/${listing.id}`}
                    className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-gray-50"
                  >
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded">
                      {listing.photo ? (
                        <Image
                          src={listing.photo}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-100">
                          <Building2 className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {listing.title}
                      </p>
                      <p className="text-sm text-gray-500">{listing.area}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium text-teal-600">
                        {formatPrice(listing.monthlyRent)}
                      </p>
                      <p className="text-gray-500">
                        {listing.views} views • {listing.inquiries} inquiries
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-teal-600" />
              Recent Messages
            </CardTitle>
            <Link href="/dashboard/chats">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {analytics.recentConversations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No messages yet</p>
            ) : (
              <div className="space-y-4">
                {analytics.recentConversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/dashboard/chats/${conv.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conv.tenant.avatar || undefined} />
                      <AvatarFallback>
                        {getInitials(
                          conv.tenant.firstName,
                          conv.tenant.lastName
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {conv.tenant.firstName} {conv.tenant.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessage || conv.listing}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(conv.updatedAt)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Viewings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-600" />
              Upcoming Viewings
            </CardTitle>
            <Link href="/dashboard/bookings">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {analytics.upcomingViewings.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No upcoming viewings
              </p>
            ) : (
              <div className="space-y-4">
                {analytics.upcomingViewings.map((viewing) => (
                  <div
                    key={viewing.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {viewing.tenant.firstName} {viewing.tenant.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{viewing.listing}</p>
                      <p className="text-sm text-teal-600">
                        {new Date(viewing.date).toLocaleDateString()} •{" "}
                        {viewing.time}
                      </p>
                    </div>
                    <Badge
                      variant={
                        viewing.status === "CONFIRMED" ? "success" : "warning"
                      }
                    >
                      {viewing.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-teal-600" />
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentReviews.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {analytics.recentReviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={review.reviewer.avatar || undefined}
                        />
                        <AvatarFallback>
                          {getInitials(
                            review.reviewer.firstName,
                            review.reviewer.lastName
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {review.reviewer.firstName} {review.reviewer.lastName}
                        </p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(review.createdAt)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm text-gray-600">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



