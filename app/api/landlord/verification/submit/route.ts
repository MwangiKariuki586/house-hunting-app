// Submit landlord verification for review API route
import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

export async function POST() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (user.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Not a landlord account' }, { status: 403 })
    }

    // Get current verification status and documents
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        verificationDocs: true,
      },
    })

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already verified or under review
    if (userData.verificationStatus === 'VERIFIED') {
      return NextResponse.json(
        { error: 'Already verified' },
        { status: 400 }
      )
    }

    if (userData.verificationStatus === 'UNDER_REVIEW') {
      return NextResponse.json(
        { error: 'Verification already under review' },
        { status: 400 }
      )
    }

    // Check required documents
    const hasId = userData.verificationDocs.some((doc) => doc.type === 'ID')
    const hasPropertyProof = userData.verificationDocs.some(
      (doc) =>
        doc.type === 'TITLE_DEED' ||
        doc.type === 'UTILITY_BILL' ||
        doc.type === 'CARETAKER_LETTER'
    )

    if (!hasId) {
      return NextResponse.json(
        { error: 'ID or passport document is required' },
        { status: 400 }
      )
    }

    if (!hasPropertyProof) {
      return NextResponse.json(
        { error: 'At least one property ownership document is required' },
        { status: 400 }
      )
    }

    // Update verification status to under review
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationStatus: 'UNDER_REVIEW',
        verificationNote: null,
      },
    })

    // TODO: Send notification to admin for review
    // TODO: Send confirmation email to landlord

    return NextResponse.json({
      message: 'Verification submitted successfully',
      status: 'UNDER_REVIEW',
    })
  } catch (error) {
    console.error('Submit verification error:', error)
    return NextResponse.json(
      { error: 'Submission failed' },
      { status: 500 }
    )
  }
}



