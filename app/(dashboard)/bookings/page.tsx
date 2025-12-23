// Bookings page for VerifiedNyumba
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { formatDate } from "@/app/lib/utils";

interface Booking {
  id: string;
  date: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  notes: string | null;
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  slot: {
    startTime: string;
    endTime: string;
    listing: {
      id: string;
      title: string;
      area: string;
      landlordId: string;
      landlord: {
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
      };
      photos: { url: string }[];
    };
  };
}

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function BookingsPage() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, userRes] = await Promise.all([
          fetch("/api/bookings"),
          fetch("/api/auth/me"),
        ]);

        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setBookings(data.bookings);
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUserId(userData.user.id);
        }
      } catch {
        console.error("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === id ? { ...b, status: status as Booking["status"] } : b
          )
        );
      }
    } catch {
      console.error("Failed to update booking");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>;
      case "CONFIRMED":
        return <Badge variant="success">Confirmed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary">Completed</Badge>;
      case "NO_SHOW":
        return <Badge variant="outline">No Show</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const upcomingBookings = bookings.filter(
    (b) =>
      ["PENDING", "CONFIRMED"].includes(b.status) &&
      new Date(b.date) >= new Date()
  );
  const pastBookings = bookings.filter(
    (b) =>
      !["PENDING", "CONFIRMED"].includes(b.status) ||
      new Date(b.date) < new Date()
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const isLandlord = booking.slot.listing.landlordId === currentUserId;
    const otherPerson = isLandlord
      ? booking.tenant
      : booking.slot.listing.landlord;

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Property Image */}
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
              {booking.slot.listing.photos[0] ? (
                <Image
                  src={booking.slot.listing.photos[0].url}
                  alt={booking.slot.listing.title}
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
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/properties/${booking.slot.listing.id}`}
                  className="font-semibold text-gray-900 hover:text-teal-600 line-clamp-1"
                >
                  {booking.slot.listing.title}
                </Link>
                {getStatusBadge(booking.status)}
              </div>

              <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {booking.slot.listing.area}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-gray-700">
                  <Calendar className="h-4 w-4 text-teal-600" />
                  {dayNames[new Date(booking.date).getDay()]},{" "}
                  {formatDate(booking.date)}
                </span>
                <span className="flex items-center gap-1 text-gray-700">
                  <Clock className="h-4 w-4 text-teal-600" />
                  {booking.slot.startTime} - {booking.slot.endTime}
                </span>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                {isLandlord ? "Visitor" : "Landlord"}: {otherPerson.firstName}{" "}
                {otherPerson.lastName}
                {booking.status === "CONFIRMED" && (
                  <span className="ml-2 text-teal-600">
                    • {otherPerson.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions for landlord */}
          {isLandlord && booking.status === "PENDING" && (
            <div className="mt-4 flex gap-2 border-t pt-4">
              <Button
                size="sm"
                onClick={() => updateBookingStatus(booking.id, "CONFIRMED")}
                className="gap-1"
              >
                <Check className="h-4 w-4" />
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateBookingStatus(booking.id, "CANCELLED")}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Decline
              </Button>
            </div>
          )}

          {/* Cancel option for tenant */}
          {!isLandlord && booking.status === "PENDING" && (
            <div className="mt-4 border-t pt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateBookingStatus(booking.id, "CANCELLED")}
              >
                Cancel Booking
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Viewing Bookings</h1>
        <p className="mt-1 text-gray-600">
          Manage your property viewing appointments
        </p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12 text-center">
                <Calendar className="mb-4 h-12 w-12 text-gray-400" />
                <p className="text-lg font-medium text-gray-900">
                  No upcoming viewings
                </p>
                <p className="mt-2 text-gray-600">
                  Book a viewing on a property to see it here
                </p>
                <Link href="/properties">
                  <Button className="mt-4">Browse Properties</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No past viewings</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}



