// Admin verification management API route
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'
import { calculateProfileCompleteness } from '@/app/lib/profile-tier'

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

    // Normalized query: Find users with pending LandlordVerification
    const pendingVerifications = await prisma.user.findMany({
      where: {
        role: 'LANDLORD',
        landlordVerification: {
          status: 'UNDER_REVIEW'
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        landlordVerification: {
          select: {
            note: true, // For review scope
          }
        },
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

    // Flatten result for frontend compatibility if needed
    const notifications = pendingVerifications.map(v => ({
      ...v,
      verificationNote: v.landlordVerification?.note // Map note back
    }))

    return NextResponse.json({ verifications: notifications })
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

    // Get the landlord user and verification info
    const landlord = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        landlordVerification: true // Get all verification fields
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

    // Helper to get verification safely
    const verif = landlord.landlordVerification;

    if (!verif || verif.status !== 'UNDER_REVIEW') {
      return NextResponse.json(
        { error: 'User is not pending verification' },
        { status: 400 }
      )
    }

    // Determine review scope from the note attached during submission
    let reviewScope = 'FULL'
    if (verif.note && verif.note.startsWith('Review Scope: ')) {
      reviewScope = verif.note.replace('Review Scope: ', '')
    }

    // Prepare update data for LandlordVerification
    const updateData: any = {
      status: action === 'approve' ? 'VERIFIED' : 'REJECTED',
      note: action === 'reject' ? note : null, // Clear scope note on approval
      verifiedAt: action === 'approve' ? new Date() : null,
    }

    if (action === 'approve') {
      // Calculate new flags based on scope
      const newIdVerified = reviewScope === 'IDENTITY' || reviewScope === 'FULL' || verif.idVerified
      const newPropertyVerified = reviewScope === 'PROPERTY' || reviewScope === 'FULL' || verif.propertyVerified

      // Calculate completeness
      const newCompleteness = calculateProfileCompleteness({
        emailVerified: landlord.emailVerified,
        phoneVerified: landlord.phoneVerified,
        idVerified: newIdVerified,
        propertyOwnerVerified: newPropertyVerified,
        verificationStatus: 'VERIFIED',
      })

      // Determine correct tier (mirroring logic in lib/profile-tier.ts)
      let newTier = 'BASIC'
      if (newIdVerified && newPropertyVerified) newTier = 'FULLY_VERIFIED'
      else if (newIdVerified) newTier = 'ID_VERIFIED'
      else if (landlord.phoneVerified) newTier = 'PHONE_VERIFIED'

      // Apply updates
      if (reviewScope === 'IDENTITY' || reviewScope === 'FULL') {
        updateData.idVerified = true
        updateData.idVerifiedAt = new Date()
      }

      if (reviewScope === 'PROPERTY' || reviewScope === 'FULL') {
        updateData.propertyVerified = true
        updateData.propertyVerifiedAt = new Date()
      }

      updateData.tier = newTier
      updateData.completeness = newCompleteness
    }

    // Update verification status on the relation model
    await prisma.landlordVerification.update({
      where: { userId: userId },
      data: updateData,
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
