// Landlord verification document upload API route
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'
import { uploadImage, deleteResource } from '@/app/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (user.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Not a landlord account' }, { status: 403 })
    }

    const body = await request.json()
    const { type, file } = body

    if (!type || !file) {
      return NextResponse.json(
        { error: 'Document type and file are required' },
        { status: 400 }
      )
    }

    // Validate document type
    const validTypes = ['ID', 'TITLE_DEED', 'UTILITY_BILL', 'CARETAKER_LETTER']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      )
    }

    // Check verification status - don't allow uploads if already verified
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { verificationStatus: true },
    })

    if (userData?.verificationStatus === 'VERIFIED') {
      return NextResponse.json(
        { error: 'Already verified' },
        { status: 400 }
      )
    }

    // Delete existing document of same type if exists
    const existingDoc = await prisma.verificationDoc.findFirst({
      where: { userId: user.id, type },
    })

    if (existingDoc) {
      await deleteResource(existingDoc.publicId)
      await prisma.verificationDoc.delete({
        where: { id: existingDoc.id },
      })
    }

    // Upload to Cloudinary
    const { url, publicId } = await uploadImage(file, 'verificationDoc')

    // Save to database
    const doc = await prisma.verificationDoc.create({
      data: {
        userId: user.id,
        type,
        url,
        publicId,
      },
    })

    // Reset verification status if was rejected
    if (userData?.verificationStatus === 'REJECTED') {
      await prisma.user.update({
        where: { id: user.id },
        data: { verificationStatus: 'PENDING', verificationNote: null },
      })
    }

    return NextResponse.json({
      message: 'Document uploaded successfully',
      url: doc.url,
      publicId: doc.publicId,
    })
  } catch (error) {
    console.error('Upload verification doc error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { publicId } = body

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      )
    }

    // Find and verify ownership
    const doc = await prisma.verificationDoc.findFirst({
      where: { publicId, userId: user.id },
    })

    if (!doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete from Cloudinary
    await deleteResource(publicId)

    // Delete from database
    await prisma.verificationDoc.delete({
      where: { id: doc.id },
    })

    return NextResponse.json({ message: 'Document deleted successfully' })
  } catch (error) {
    console.error('Delete verification doc error:', error)
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    )
  }
}

