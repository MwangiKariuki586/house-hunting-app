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
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        verificationStatus: true,
        verificationNote: true,
        verificationDocs: {
          select: {
            type: true,
            url: true,
            publicId: true,
          },
        },
      },
    })

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      status: userData.verificationStatus,
      note: userData.verificationNote,
      documents: userData.verificationDocs,
    })
  } catch (error) {
    console.error('Get verification status error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}



