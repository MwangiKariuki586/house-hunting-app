// Admin verification management API route
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

// Get pending verifications (admin only)
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const pendingVerifications = await prisma.user.findMany({
      where: {
        role: 'LANDLORD',
        verificationStatus: 'UNDER_REVIEW',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        verificationDocs: {
          select: {
            id: true,
            type: true,
            url: true,
            uploadedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json({ verifications: pendingVerifications })
  } catch (error) {
    console.error('Get pending verifications error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

// Approve or reject verification (admin only)
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
    const { userId, action, note } = body

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Get the landlord user
    const landlord = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        verificationStatus: true,
      },
    })

    if (!landlord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (landlord.role !== 'LANDLORD') {
      return NextResponse.json(
        { error: 'User is not a landlord' },
        { status: 400 }
      )
    }

    if (landlord.verificationStatus !== 'UNDER_REVIEW') {
      return NextResponse.json(
        { error: 'User is not pending verification' },
        { status: 400 }
      )
    }

    // Update verification status
    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: action === 'approve' ? 'VERIFIED' : 'REJECTED',
        verificationNote: action === 'reject' ? note : null,
        verifiedAt: action === 'approve' ? new Date() : null,
      },
    })

    // TODO: Send notification email to landlord about verification result

    return NextResponse.json({
      message: `Verification ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
    })
  } catch (error) {
    console.error('Process verification error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}



