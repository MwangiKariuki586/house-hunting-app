// Reviews API route for VerifiedNyumba
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'
import { z } from 'zod'

const reviewSchema = z.object({
  targetUserId: z.string().min(1),
  listingId: z.string().optional(),
  accuracyRating: z.number().min(1).max(5),
  responsivenessRating: z.number().min(1).max(5),
  overallRating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

// Get reviews for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const reviews = await prisma.review.findMany({
      where: { targetUserId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    // Calculate averages
    const stats = reviews.length > 0 ? {
      averageAccuracy: reviews.reduce((acc, r) => acc + r.accuracyRating, 0) / reviews.length,
      averageResponsiveness: reviews.reduce((acc, r) => acc + r.responsivenessRating, 0) / reviews.length,
      averageOverall: reviews.reduce((acc, r) => acc + r.overallRating, 0) / reviews.length,
      totalReviews: reviews.length,
    } : null

    return NextResponse.json({ reviews, stats })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

// Create review
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validationResult = reviewSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { targetUserId, listingId, accuracyRating, responsivenessRating, overallRating, comment } = validationResult.data

    // Can't review yourself
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'Cannot review yourself' },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already reviewed (for this listing)
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: user.id,
        targetUserId,
        listingId: listingId || null,
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this user' },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        reviewerId: user.id,
        targetUserId,
        listingId,
        accuracyRating,
        responsivenessRating,
        overallRating,
        comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

