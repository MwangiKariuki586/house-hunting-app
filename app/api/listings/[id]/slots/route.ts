// Viewing slots API route for VerifiedNyumba
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

// Get viewing slots for a listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const slots = await prisma.viewingSlot.findMany({
      where: {
        listingId: id,
        isActive: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Get slots error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

// Create or update viewing slots (landlord only)
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

    // Verify ownership
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { landlordId: true },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.landlordId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const body = await request.json()
    const { slots } = body

    if (!slots || !Array.isArray(slots)) {
      return NextResponse.json(
        { error: 'Slots array is required' },
        { status: 400 }
      )
    }

    // Delete existing slots
    await prisma.viewingSlot.deleteMany({
      where: { listingId: id },
    })

    // Create new slots
    const createdSlots = await prisma.viewingSlot.createMany({
      data: slots.map((slot: { dayOfWeek: number; startTime: string; endTime: string }) => ({
        listingId: id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: true,
      })),
    })

    return NextResponse.json({
      message: `${createdSlots.count} slots created`,
    })
  } catch (error) {
    console.error('Create slots error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

