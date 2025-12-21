// Single listing API route for VerifiedNyumba
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'
import { updateListingSchema } from '@/app/lib/validations/listing'

// Get single listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verificationStatus: true,
            createdAt: true,
            _count: {
              select: { listings: true },
            },
          },
        },
        viewingSlots: {
          where: { isActive: true },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { reviews: true },
        },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    // Check if user has saved this listing
    const user = await getCurrentUser()
    let isSaved = false
    if (user) {
      const saved = await prisma.savedListing.findUnique({
        where: {
          userId_listingId: {
            userId: user.id,
            listingId: id,
          },
        },
      })
      isSaved = !!saved
    }

    return NextResponse.json({ listing, isSaved })
  } catch (error) {
    console.error('Get listing error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

// Update listing (landlord only, owner only)
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

    // Get listing and check ownership
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

    // Validate update data
    const validationResult = updateListingSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    // Update listing
    const updated = await prisma.listing.update({
      where: { id },
      data: validationResult.data,
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            verificationStatus: true,
          },
        },
      },
    })

    return NextResponse.json({ listing: updated })
  } catch (error) {
    console.error('Update listing error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

// Delete listing (landlord only, owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id } = await params

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get listing and check ownership
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

    // Soft delete - mark as deleted
    await prisma.listing.update({
      where: { id },
      data: { status: 'DELETED' },
    })

    return NextResponse.json({ message: 'Listing deleted successfully' })
  } catch (error) {
    console.error('Delete listing error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}



