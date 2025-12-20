// Listing photos upload API route for VerifiedNyumba
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/lib/auth'
import { uploadImage, deleteResource } from '@/app/lib/cloudinary'

// Upload photo
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (user.role !== 'LANDLORD' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only landlords can upload photos' }, { status: 403 })
    }

    const body = await request.json()
    const { file } = body

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Upload to Cloudinary with watermark
    const { url, publicId } = await uploadImage(file, 'listingPhoto')

    return NextResponse.json({
      message: 'Photo uploaded successfully',
      url,
      publicId,
    })
  } catch (error) {
    console.error('Upload photo error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

// Delete photo
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { publicId } = body

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID is required' }, { status: 400 })
    }

    // Delete from Cloudinary
    await deleteResource(publicId)

    return NextResponse.json({ message: 'Photo deleted successfully' })
  } catch (error) {
    console.error('Delete photo error:', error)
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    )
  }
}

