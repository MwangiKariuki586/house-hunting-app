// Reports API route for VerifiedNyumba
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'
import { z } from 'zod'

const reportSchema = z.object({
  listingId: z.string().min(1),
  reason: z.enum([
    'FAKE_LISTING',
    'AGENT_PRETENDING',
    'ALREADY_OCCUPIED',
    'MISLEADING_PHOTOS',
    'WRONG_PRICE',
    'SCAM',
    'OTHER',
  ]),
  description: z.string().max(1000).optional(),
  evidence: z.array(z.string()).optional(),
})

// Get user's reports
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const reports = await prisma.report.findMany({
      where: { reporterId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            area: true,
          },
        },
      },
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

// Create report
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validationResult = reportSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { listingId, reason, description, evidence } = validationResult.data

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, landlordId: true },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Can't report your own listing
    if (listing.landlordId === user.id) {
      return NextResponse.json(
        { error: 'Cannot report your own listing' },
        { status: 400 }
      )
    }

    // Check if already reported by this user
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: user.id,
        listingId,
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
    })

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this listing' },
        { status: 400 }
      )
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        listingId,
        reason,
        description,
        evidence: evidence || [],
      },
    })

    // Check for scam patterns
    await checkScamPatterns(listingId)

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error('Create report error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

// Scam detection function
async function checkScamPatterns(listingId: string) {
  try {
    // Get listing details
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        landlord: true,
        photos: true,
      },
    })

    if (!listing) return

    // Check 1: Multiple reports on same listing
    const reportCount = await prisma.report.count({
      where: {
        listingId,
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
    })

    // If 3+ reports, flag for review
    if (reportCount >= 3) {
      await prisma.listing.update({
        where: { id: listingId },
        data: { status: 'PAUSED' },
      })
      // TODO: Notify admin
    }

    // Check 2: Multiple listings with same phone number from different "landlords"
    const samePhoneListings = await prisma.listing.count({
      where: {
        landlord: { phone: listing.landlord.phone },
        id: { not: listingId },
        status: 'ACTIVE',
      },
    })

    // If this phone has 5+ active listings, flag
    if (samePhoneListings >= 5) {
      // TODO: Notify admin about potential agent activity
    }

    // Check 3: Reused photos (would require image hashing - simplified here)
    // This would need to be implemented with actual image comparison

  } catch (error) {
    console.error('Scam pattern check error:', error)
  }
}



