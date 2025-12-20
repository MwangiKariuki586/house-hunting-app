// User saved listings API route for VerifiedNyumba
import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

// Get user's saved listings
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const saved = await prisma.savedListing.findMany({
      where: { userId: user.id },
      orderBy: { savedAt: 'desc' },
      include: {
        listing: {
          include: {
            photos: {
              orderBy: { order: 'asc' },
            },
            landlord: {
              select: {
                verificationStatus: true,
              },
            },
          },
        },
      },
    })

    // Filter out deleted listings
    const activeSaved = saved.filter(
      (s) => s.listing.status !== 'DELETED'
    )

    return NextResponse.json({ saved: activeSaved })
  } catch (error) {
    console.error('Get saved listings error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

