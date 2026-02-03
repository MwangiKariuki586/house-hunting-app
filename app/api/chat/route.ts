// Chat conversations API route for VerifiedNyumba
import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

// Get all conversations for current user
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { tenantId: user.id },
          { landlordId: user.id },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
          },
        },
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
            landlordVerification: {
              select: {
                status: true,
              },
            },
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            area: true,
            monthlyRent: true,
            photos: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                readAt: null,
                senderId: { not: user.id },
              },
            },
          },
        },
      },
    })

    // Format conversations
    const formattedConversations = conversations.map((conv) => {
      const otherUser = conv.tenantId === user.id ? conv.landlord : conv.tenant
      const isTenant = conv.tenantId === user.id
      const canSeePhone =
        (conv.tenantId === user.id && conv.landlordRevealed) ||
        (conv.landlordId === user.id && conv.tenantRevealed)

      return {
        id: conv.id,
        otherUser: {
          ...otherUser,
          phone: canSeePhone ? otherUser.phone : null,
          verificationStatus: isTenant
            ? conv.landlord.landlordVerification?.status
            : null,
        },
        listing: conv.listing,
        lastMessage: conv.messages[0] || null,
        unreadCount: conv._count.messages,
        phoneRevealed:
          conv.tenantId === user.id ? conv.tenantRevealed : conv.landlordRevealed,
        otherPhoneRevealed:
          conv.tenantId === user.id ? conv.landlordRevealed : conv.tenantRevealed,
        updatedAt: conv.updatedAt,
      }
    })

    return NextResponse.json({ conversations: formattedConversations })
  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}



