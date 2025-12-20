// Phone reveal API route for VerifiedNyumba
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

// Reveal phone number to the other party
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id } = await params

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: {
        tenantId: true,
        landlordId: true,
        tenantRevealed: true,
        landlordRevealed: true,
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Check if user is part of conversation
    const isTenant = conversation.tenantId === user.id
    const isLandlord = conversation.landlordId === user.id

    if (!isTenant && !isLandlord) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Update the reveal status
    await prisma.conversation.update({
      where: { id },
      data: isTenant ? { tenantRevealed: true } : { landlordRevealed: true },
    })

    // Create a system message
    await prisma.message.create({
      data: {
        conversationId: id,
        senderId: user.id,
        content: `${user.firstName} has shared their phone number with you.`,
        isPreFilled: false,
      },
    })

    return NextResponse.json({
      message: 'Phone number revealed',
      revealed: true,
    })
  } catch (error) {
    console.error('Reveal phone error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

