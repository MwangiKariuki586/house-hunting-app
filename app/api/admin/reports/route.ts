// Admin reports management API route for VerifiedNyumba
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

// Get pending reports (admin only)
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const reports = await prisma.report.findMany({
      where: {
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        listing: {
          include: {
            landlord: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                landlordVerification: { select: { status: true } },
              },
            },
            photos: {
              take: 3,
            },
          },
        },
      },
    })

    // Map to flatten verification status
    const flattenedReports = reports.map(r => ({
      ...r,
      listing: r.listing ? {
        ...r.listing,
        landlord: r.listing.landlord ? {
          ...r.listing.landlord,
          verificationStatus: r.listing.landlord.landlordVerification?.status || 'PENDING',
          landlordVerification: undefined
        } : null
      } : null
    }))

    return NextResponse.json({ reports: flattenedReports })
  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

// Process report (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { reportId, action, resolution } = body

    if (!reportId || !action) {
      return NextResponse.json(
        { error: 'Report ID and action are required' },
        { status: 400 }
      )
    }

    const validActions = ['resolve', 'dismiss', 'remove_listing', 'ban_user']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get report
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        listing: true,
      },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Process action
    switch (action) {
      case 'resolve':
        await prisma.report.update({
          where: { id: reportId },
          data: {
            status: 'RESOLVED',
            resolvedAt: new Date(),
            resolvedBy: user.id,
            resolution,
          },
        })
        break

      case 'dismiss':
        await prisma.report.update({
          where: { id: reportId },
          data: {
            status: 'DISMISSED',
            resolvedAt: new Date(),
            resolvedBy: user.id,
            resolution: resolution || 'Report dismissed - insufficient evidence',
          },
        })
        break

      case 'remove_listing':
        await prisma.$transaction([
          prisma.listing.update({
            where: { id: report.listingId },
            data: { status: 'DELETED' },
          }),
          prisma.report.update({
            where: { id: reportId },
            data: {
              status: 'RESOLVED',
              resolvedAt: new Date(),
              resolvedBy: user.id,
              resolution: resolution || 'Listing removed due to policy violation',
            },
          }),
        ])
        break

      case 'ban_user':
        // This would typically involve more complex logic
        // For now, just mark verification as rejected using normalized model
        await prisma.$transaction([
          prisma.landlordVerification.upsert({
            where: { userId: report.listing.landlordId },
            create: {
              userId: report.listing.landlordId,
              status: 'REJECTED',
              note: 'Account suspended due to policy violations'
            },
            update: {
              status: 'REJECTED',
              note: 'Account suspended due to policy violations',
            },
          }),
          prisma.listing.updateMany({
            where: { landlordId: report.listing.landlordId },
            data: { status: 'DELETED' },
          }),
          prisma.report.update({
            where: { id: reportId },
            data: {
              status: 'RESOLVED',
              resolvedAt: new Date(),
              resolvedBy: user.id,
              resolution: resolution || 'User banned and all listings removed',
            },
          }),
        ])
        break
    }

    return NextResponse.json({ message: `Report ${action}d successfully` })
  } catch (error) {
    console.error('Process report error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
