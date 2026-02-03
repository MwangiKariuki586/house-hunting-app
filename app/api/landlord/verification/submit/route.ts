// Submit landlord verification for review API route
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (user.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Not a landlord account' }, { status: 403 })
    }

    let verificationType = 'FULL'
    try {
      const body = await req.json()
      if (body.type) verificationType = body.type
    } catch (e) {
      // Body parsing failed or empty, default to FULL
    }

    // Get current verification status and documents
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        verificationDocs: true,
        landlordVerification: true,
      },
    })

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentStatus = userData.landlordVerification?.status || 'PENDING'
    const currentTier = userData.landlordVerification?.tier || 'BASIC'
    const idVerified = userData.landlordVerification?.idVerified || false
    const propVerified = userData.landlordVerification?.propertyVerified || false

    // Check if already fully verified
    if (currentTier === 'FULLY_VERIFIED') {
      return NextResponse.json(
        { error: 'Already fully verified' },
        { status: 400 }
      )
    }

    // Check if specifically verified for this type
    if (verificationType === 'IDENTITY' && idVerified) {
      return NextResponse.json({ error: 'Identity already verified' }, { status: 400 })
    }
    if (verificationType === 'PROPERTY' && propVerified) {
      return NextResponse.json({ error: 'Property already verified' }, { status: 400 })
    }

    // Enforce Sequential Flow
    if (verificationType === 'IDENTITY' && !userData.phoneVerified) {
      return NextResponse.json({ error: 'Please verify your phone number first.' }, { status: 403 })
    }

    if (verificationType === 'PROPERTY' && !idVerified) {
      return NextResponse.json({ error: 'Please verify your identity first.' }, { status: 403 })
    }

    // Check if under review (allow re-submission if rejected, but block if currently under review)
    if (currentStatus === 'UNDER_REVIEW') {
      return NextResponse.json(
        { error: 'Verification already under review. Please wait for the current review to complete.' },
        { status: 400 }
      )
    }

    // Check required documents based on type
    const hasId = userData.verificationDocs.some((doc) => doc.type === 'ID')
    const hasPropertyProof = userData.verificationDocs.some(
      (doc) =>
        doc.type === 'TITLE_DEED' ||
        doc.type === 'UTILITY_BILL' ||
        doc.type === 'CARETAKER_LETTER'
    )

    if (verificationType === 'IDENTITY' || verificationType === 'FULL') {
      if (!hasId) {
        return NextResponse.json(
          { error: 'ID or passport document is required' },
          { status: 400 }
        )
      }
    }

    if (verificationType === 'PROPERTY' || verificationType === 'FULL') {
      if (!hasPropertyProof) {
        return NextResponse.json(
          { error: 'At least one property ownership document is required' },
          { status: 400 }
        )
      }
    }

    // Update verification status to under review
    await prisma.landlordVerification.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        status: 'UNDER_REVIEW',
        note: `Review Scope: ${verificationType}`,
        tier: 'BASIC', // Default or fetch logic if needed
      },
      update: {
        status: 'UNDER_REVIEW',
        note: `Review Scope: ${verificationType}`,
      }
    })

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



