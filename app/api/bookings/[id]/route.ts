// Single booking API route for VerifiedNyumba
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

// Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id } = await params

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const validStatuses = ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get booking with slot and listing
    const booking = await prisma.viewingBooking.findUnique({
      where: { id },
      include: {
        slot: {
          include: {
            listing: {
              select: { landlordId: true },
            },
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check permissions
    const isLandlord = booking.slot.listing.landlordId === user.id
    const isTenant = booking.tenantId === user.id

    if (!isLandlord && !isTenant) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Tenants can only cancel
    if (isTenant && !isLandlord && status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Tenants can only cancel bookings' },
        { status: 403 }
      )
    }

    // Update booking
    const updated = await prisma.viewingBooking.update({
      where: { id },
      data: { status },
    })

    // TODO: Send notification about status change

    return NextResponse.json({ booking: updated })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}



