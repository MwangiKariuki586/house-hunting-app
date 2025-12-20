// Viewing bookings API route for VerifiedNyumba
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

// Get user's bookings
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const bookings = await prisma.viewingBooking.findMany({
      where: {
        OR: [
          { tenantId: user.id },
          { slot: { listing: { landlordId: user.id } } },
        ],
      },
      orderBy: { date: 'asc' },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        slot: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                area: true,
                landlordId: true,
                landlord: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                  },
                },
                photos: {
                  where: { isMain: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

// Create new booking
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { slotId, date, notes } = body

    if (!slotId || !date) {
      return NextResponse.json(
        { error: 'Slot ID and date are required' },
        { status: 400 }
      )
    }

    // Get slot and listing
    const slot = await prisma.viewingSlot.findUnique({
      where: { id: slotId },
      include: {
        listing: {
          select: { id: true, landlordId: true, status: true },
        },
      },
    })

    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }

    if (!slot.isActive) {
      return NextResponse.json({ error: 'Slot is not available' }, { status: 400 })
    }

    if (slot.listing.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Listing is not active' }, { status: 400 })
    }

    // Can't book your own listing
    if (slot.listing.landlordId === user.id) {
      return NextResponse.json(
        { error: 'Cannot book viewing for your own listing' },
        { status: 400 }
      )
    }

    // Check if user already has a booking for this slot on this date
    const existingBooking = await prisma.viewingBooking.findFirst({
      where: {
        tenantId: user.id,
        slotId: slotId,
        date: new Date(date),
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'You already have a booking for this slot' },
        { status: 400 }
      )
    }

    // Create booking
    const booking = await prisma.viewingBooking.create({
      data: {
        slotId,
        tenantId: user.id,
        date: new Date(date),
        notes,
      },
      include: {
        slot: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                landlord: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
      },
    })

    // TODO: Send notification to landlord

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

