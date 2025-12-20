// Socket.IO client instance for VerifiedNyumba
'use client'

import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      autoConnect: false,
      withCredentials: true,
    })
  }
  return socket
}

export const connectSocket = (token: string) => {
  const socket = getSocket()
  socket.auth = { token }
  socket.connect()
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
  }
}

// Socket event types
export interface ServerToClientEvents {
  'message:new': (message: ChatMessage) => void
  'message:read': (data: { messageId: string; readAt: string }) => void
  'user:typing': (data: { conversationId: string; userId: string; isTyping: boolean }) => void
  'user:online': (userId: string) => void
  'user:offline': (userId: string) => void
  'phone:revealed': (data: { conversationId: string; userId: string }) => void
  error: (message: string) => void
}

export interface ClientToServerEvents {
  'message:send': (data: { conversationId: string; content: string; isPreFilled?: boolean }) => void
  'message:read': (messageId: string) => void
  'typing:start': (conversationId: string) => void
  'typing:stop': (conversationId: string) => void
  'phone:reveal': (conversationId: string) => void
  'join:conversation': (conversationId: string) => void
  'leave:conversation': (conversationId: string) => void
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  isPreFilled: boolean
  readAt: string | null
  createdAt: string
  sender: {
    id: string
    firstName: string
    lastName: string
    avatar: string | null
  }
}

