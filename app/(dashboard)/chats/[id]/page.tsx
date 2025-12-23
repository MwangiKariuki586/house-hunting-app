// Chat conversation page for VerifiedNyumba
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Send, Phone, ArrowLeft, BadgeCheck, Loader2, Eye } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import {
  cn,
  formatPrice,
  formatRelativeTime,
  getInitials,
} from "@/app/lib/utils";

// Pre-filled question templates
const preFilledQuestions = [
  "Is this property still available?",
  "Is the rent negotiable?",
  "When can I schedule a viewing?",
  "What are the move-in requirements?",
  "Is water/electricity included?",
];

interface Message {
  id: string;
  content: string;
  senderId: string;
  isPreFilled: boolean;
  readAt: string | null;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

interface ConversationData {
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
  messages: Message[];
  phoneRevealed: boolean;
  otherPhoneRevealed: boolean;
  isTenant: boolean;
}

export default function ChatConversationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const [conversation, setConversation] =
    React.useState<ConversationData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [newMessage, setNewMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  // Fetch current user
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data.user.id);
        }
      } catch {
        console.error("Failed to fetch user");
      }
    };
    fetchUser();
  }, []);

  // Fetch conversation
  React.useEffect(() => {
    const fetchConversation = async () => {
      try {
        const res = await fetch(`/api/chat/${id}`);
        if (res.ok) {
          const data = await res.json();
          setConversation(data.conversation);
        } else if (res.status === 404) {
          router.push("/dashboard/chats");
        }
      } catch {
        console.error("Failed to fetch conversation");
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversation();
  }, [id, router]);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  // Poll for new messages (will be replaced with WebSocket)
  React.useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/${id}`);
        if (res.ok) {
          const data = await res.json();
          setConversation(data.conversation);
        }
      } catch {
        // Ignore polling errors
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [id]);

  const sendMessage = async (content: string, isPreFilled = false) => {
    if (!content.trim() || isSending) return;

    setIsSending(true);
    setNewMessage("");

    try {
      const res = await fetch(`/api/chat/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, isPreFilled }),
      });

      if (res.ok) {
        const data = await res.json();
        setConversation((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, data.message],
          };
        });
      }
    } catch {
      console.error("Failed to send message");
      setNewMessage(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const revealPhone = async () => {
    if (!confirm("Are you sure you want to share your phone number?")) return;

    try {
      const res = await fetch(`/api/chat/${id}/reveal`, {
        method: "POST",
      });

      if (res.ok) {
        setConversation((prev) => {
          if (!prev) return null;
          return { ...prev, phoneRevealed: true };
        });
      }
    } catch {
      console.error("Failed to reveal phone");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!conversation) {
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/dashboard/chats">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.otherUser.avatar || undefined} />
          <AvatarFallback>
            {getInitials(
              conversation.otherUser.firstName,
              conversation.otherUser.lastName
            )}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              {conversation.otherUser.firstName}{" "}
              {conversation.otherUser.lastName}
            </span>
            {conversation.otherUser.verificationStatus === "VERIFIED" && (
              <BadgeCheck className="h-4 w-4 text-teal-600" />
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">
            {conversation.listing.title}
          </p>
        </div>

        {/* Phone reveal button */}
        {conversation.otherPhoneRevealed && conversation.otherUser.phone ? (
          <a
            href={`tel:${conversation.otherUser.phone}`}
            className="flex items-center gap-2 rounded-full bg-teal-100 px-4 py-2 text-sm font-medium text-teal-700"
          >
            <Phone className="h-4 w-4" />
            {conversation.otherUser.phone}
          </a>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={revealPhone}
            disabled={conversation.phoneRevealed}
          >
            {conversation.phoneRevealed ? "Phone Shared" : "Share Phone"}
          </Button>
        )}
      </div>

      {/* Listing Info Banner */}
      <Link
        href={`/properties/${conversation.listing.id}`}
        className="flex items-center gap-3 border-b bg-gray-50 p-3 hover:bg-gray-100 transition-colors"
      >
        {conversation.listing.photos[0] && (
          <div className="relative h-12 w-16 overflow-hidden rounded">
            <Image
              src={conversation.listing.photos[0].url}
              alt={conversation.listing.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {conversation.listing.title}
          </p>
          <p className="text-sm text-gray-500">
            {conversation.listing.area} •{" "}
            {formatPrice(conversation.listing.monthlyRent)}/mo
          </p>
        </div>
        <Eye className="h-4 w-4 text-gray-400" />
      </Link>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          conversation.messages.map((message) => {
            const isOwn = message.senderId === currentUserId;

            return (
              <div
                key={message.id}
                className={cn("flex", isOwn ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2",
                    isOwn
                      ? "bg-teal-600 text-white rounded-br-md"
                      : "bg-gray-100 text-gray-900 rounded-bl-md"
                  )}
                >
                  <p>{message.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      isOwn ? "text-teal-100" : "text-gray-500"
                    )}
                  >
                    {formatRelativeTime(message.createdAt)}
                    {isOwn && message.readAt && " • Read"}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Pre-filled Questions */}
      {conversation.messages.length < 3 && (
        <div className="border-t p-3">
          <p className="mb-2 text-xs font-medium text-gray-500">
            Quick questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {preFilledQuestions.map((question) => (
              <button
                key={question}
                onClick={() => sendMessage(question, true)}
                className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                disabled={isSending}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full"
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}



