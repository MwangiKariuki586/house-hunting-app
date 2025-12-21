// Save/unsave listing API route for VerifiedNyumba
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

// Save listing
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

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Check if already saved
    const existing = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: id,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ message: 'Already saved' })
    }

    // Create saved listing
    await prisma.savedListing.create({
      data: {
        userId: user.id,
        listingId: id,
      },
    })

    return NextResponse.json({ message: 'Listing saved successfully' })
  } catch (error) {
    console.error('Save listing error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

// Unsave listing
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

    // Delete saved listing
    await prisma.savedListing.deleteMany({
      where: {
        userId: user.id,
        listingId: id,
      },
    })

    return NextResponse.json({ message: 'Listing unsaved successfully' })
  } catch (error) {
    console.error('Unsave listing error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}



