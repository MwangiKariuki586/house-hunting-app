// Landlord listings API route for VerifiedNyumba
import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

// Get landlord's own listings
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (user.role !== 'LANDLORD' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not a landlord' }, { status: 403 })
    }

    const listings = await prisma.listing.findMany({
      where: {
        landlordId: user.id,
        status: { not: 'DELETED' },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        photos: {
          where: { isMain: true },
          take: 1,
        },
        _count: {
          select: { conversations: true },
        },
      },
    })

    return NextResponse.json({ listings })
  } catch (error) {
    console.error('Get landlord listings error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}



