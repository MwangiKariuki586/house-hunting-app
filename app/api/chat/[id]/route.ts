// Single conversation API route for VerifiedNyumba
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

// Get conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id } = await params

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
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
            verificationStatus: true,
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
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Check access
    if (conversation.tenantId !== user.id && conversation.landlordId !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const otherUser =
      conversation.tenantId === user.id ? conversation.landlord : conversation.tenant
    const isTenant = conversation.tenantId === user.id
    const canSeePhone = isTenant ? conversation.landlordRevealed : conversation.tenantRevealed

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: user.id },
        readAt: null,
      },
      data: { readAt: new Date() },
    })

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        otherUser: {
          ...otherUser,
          phone: canSeePhone ? otherUser.phone : null,
        },
        listing: conversation.listing,
        messages: conversation.messages,
        phoneRevealed: isTenant ? conversation.tenantRevealed : conversation.landlordRevealed,
        otherPhoneRevealed: isTenant ? conversation.landlordRevealed : conversation.tenantRevealed,
        isTenant,
      },
    })
  } catch (error) {
    console.error('Get conversation error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}



