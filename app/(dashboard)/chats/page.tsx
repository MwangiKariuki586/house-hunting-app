// Chat list page for VerifiedNyumba
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, BadgeCheck, Loader2 } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import { formatRelativeTime, formatPrice, getInitials } from "@/app/lib/utils";

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    phone: string | null;
    verificationStatus?: string;
  };
  listing: {
    id: string;
    title: string;
    area: string;
    monthlyRent: number;
    photos: { url: string }[];
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

export default function ChatsPage() {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/chat");
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations);
        }
      } catch {
        console.error("Failed to fetch conversations");
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-gray-600">
          Your conversations with landlords and tenants
        </p>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-gray-400" />
            <p className="text-lg font-medium text-gray-900">No messages yet</p>
            <p className="mt-2 text-gray-600">
              Start a conversation by contacting a landlord on a property
              listing
            </p>
            <Link
              href="/properties"
              className="mt-4 text-teal-600 hover:text-teal-700"
            >
              Browse Properties
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/dashboard/chats/${conversation.id}`}
            >
              <Card className="transition-colors hover:bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* User Avatar */}
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage
                        src={conversation.otherUser.avatar || undefined}
                      />
                      <AvatarFallback>
                        {getInitials(
                          conversation.otherUser.firstName,
                          conversation.otherUser.lastName
                        )}
                      </AvatarFallback>
                    </Avatar>

                    {/* Conversation Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {conversation.otherUser.firstName}{" "}
                          {conversation.otherUser.lastName}
                        </span>
                        {conversation.otherUser.verificationStatus ===
                          "VERIFIED" && (
                          <BadgeCheck className="h-4 w-4 text-teal-600" />
                        )}
                        {conversation.unreadCount > 0 && (
                          <Badge className="ml-auto">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>

                      {/* Last message */}
                      {conversation.lastMessage && (
                        <p className="mt-0.5 text-sm text-gray-600 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}

                      {/* Listing info */}
                      <div className="mt-2 flex items-center gap-2">
                        {conversation.listing.photos[0] && (
                          <div className="relative h-8 w-12 overflow-hidden rounded">
                            <Image
                              src={conversation.listing.photos[0].url}
                              alt={conversation.listing.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="text-xs text-gray-500 truncate">
                          {conversation.listing.title} •{" "}
                          {formatPrice(conversation.listing.monthlyRent)}/mo
                        </span>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="text-xs text-gray-400 shrink-0">
                      {formatRelativeTime(conversation.updatedAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

