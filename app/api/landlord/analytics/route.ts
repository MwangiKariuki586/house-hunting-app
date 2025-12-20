// Landlord analytics API route for VerifiedNyumba
import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (user.role !== 'LANDLORD' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not a landlord' }, { status: 403 })
    }

    // Get all listings for this landlord
    const listings = await prisma.listing.findMany({
      where: {
        landlordId: user.id,
        status: { not: 'DELETED' },
      },
      include: {
        photos: {
          where: { isMain: true },
          take: 1,
        },
        _count: {
          select: {
            conversations: true,
            savedBy: true,
          },
        },
      },
    })

    // Calculate totals
    const totalViews = listings.reduce((acc, l) => acc + l.viewCount, 0)
    const totalInquiries = listings.reduce((acc, l) => acc + l._count.conversations, 0)
    const totalSaves = listings.reduce((acc, l) => acc + l._count.savedBy, 0)

    // Status breakdown
    const statusBreakdown = {
      active: listings.filter((l) => l.status === 'ACTIVE').length,
      paused: listings.filter((l) => l.status === 'PAUSED').length,
      taken: listings.filter((l) => l.status === 'TAKEN').length,
    }

    // Get recent conversations
    const recentConversations = await prisma.conversation.findMany({
      where: { landlordId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        listing: {
          select: {
            title: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    // Get upcoming viewings
    const upcomingViewings = await prisma.viewingBooking.findMany({
      where: {
        slot: {
          listing: {
            landlordId: user.id,
          },
        },
        status: { in: ['PENDING', 'CONFIRMED'] },
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
      take: 5,
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        slot: {
          include: {
            listing: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    })

    // Get reviews
    const reviews = await prisma.review.findMany({
      where: { targetUserId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        reviewer: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.overallRating, 0) / reviews.length
      : 0

    // Top performing listings (by views)
    const topListings = [...listings]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5)
      .map((l) => ({
        id: l.id,
        title: l.title,
        area: l.area,
        views: l.viewCount,
        inquiries: l._count.conversations,
        saves: l._count.savedBy,
        monthlyRent: l.monthlyRent,
        photo: l.photos[0]?.url || null,
      }))

    return NextResponse.json({
      overview: {
        totalListings: listings.length,
        totalViews,
        totalInquiries,
        totalSaves,
        avgRating: Math.round(avgRating * 10) / 10,
        statusBreakdown,
      },
      topListings,
      recentConversations: recentConversations.map((c) => ({
        id: c.id,
        tenant: c.tenant,
        listing: c.listing.title,
        lastMessage: c.messages[0]?.content || null,
        updatedAt: c.updatedAt,
      })),
      upcomingViewings: upcomingViewings.map((v) => ({
        id: v.id,
        tenant: v.tenant,
        listing: v.slot.listing.title,
        date: v.date,
        time: `${v.slot.startTime} - ${v.slot.endTime}`,
        status: v.status,
      })),
      recentReviews: reviews.map((r) => ({
        id: r.id,
        reviewer: r.reviewer,
        rating: r.overallRating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

