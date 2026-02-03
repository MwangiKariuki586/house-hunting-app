// Landlord verification status API route
import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (user.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Not a landlord account' }, { status: 403 })
    }

    // Get user with verification documents
    const data = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        landlordVerification: {
          select: {
            status: true,
            note: true,
            idVerified: true,
            propertyVerified: true,
            tier: true,
          }
        },
        verificationDocs: {
          select: {
            type: true,
            url: true,
            publicId: true,
          },
        },
      },
    })

    if (!data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      status: data.landlordVerification?.status || 'PENDING',
      note: data.landlordVerification?.note,
      documents: data.verificationDocs,
      idVerified: data.landlordVerification?.idVerified || false,
      propertyOwnerVerified: data.landlordVerification?.propertyVerified || false,
      profileTier: data.landlordVerification?.tier || 'BASIC',
      phoneVerified: user.phoneVerified,
    })
  } catch (error) {
    console.error('Get verification status error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}



