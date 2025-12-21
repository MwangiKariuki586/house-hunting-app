// Start conversation API route for VerifiedNyumba
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

// Start or get existing conversation
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { listingId, message } = body

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }

    // Get listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, landlordId: true, status: true },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Listing is not active' }, { status: 400 })
    }

    // Can't message yourself
    if (listing.landlordId === user.id) {
      return NextResponse.json({ error: 'Cannot message your own listing' }, { status: 400 })
    }

    // Check for existing conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        tenantId_landlordId_listingId: {
          tenantId: user.id,
          landlordId: listing.landlordId,
          listingId: listing.id,
        },
      },
    })

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          tenantId: user.id,
          landlordId: listing.landlordId,
          listingId: listing.id,
        },
      })
    }

    // Send initial message if provided
    if (message?.trim()) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          content: message.trim(),
          isPreFilled: false,
        },
      })

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      })
    }

    return NextResponse.json({
      conversationId: conversation.id,
    })
  } catch (error) {
    console.error('Start conversation error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}



