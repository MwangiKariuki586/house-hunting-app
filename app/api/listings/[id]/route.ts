// Single listing API route for VerifiedNyumba
import { NextRequest } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'
import { updateListingSchema } from '@/app/lib/validations/listing'
import { successResponse, errorResponse, handleAPIError } from '@/app/lib/api-response'
import { logger } from '@/app/lib/logger'

// Get single listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verificationStatus: true,
            createdAt: true,
            _count: {
              select: { listings: true },
            },
          },
        },
        viewingSlots: {
          where: { isActive: true },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { reviews: true },
        },
      },
    })

    if (!listing) {
      return errorResponse('Listing not found', 'NOT_FOUND', 404)
    }

    // Increment view count
    await prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    // Check if user has saved this listing
    const user = await getCurrentUser()
    let isSaved = false
    if (user) {
      const saved = await prisma.savedListing.findUnique({
        where: {
          userId_listingId: {
            userId: user.id,
            listingId: id,
          },
        },
      })
      isSaved = !!saved
    }

    return successResponse({ listing, isSaved })
  } catch (error) {
    logger.error('Get listing error', error)
    return handleAPIError(error)
  }
}

// Update listing (landlord only, owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id } = await params

    if (!user) {
      return errorResponse('Not authenticated', 'AUTHENTICATION_ERROR', 401)
    }

    // Get listing and check ownership
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { landlordId: true },
    })

    if (!listing) {
      return errorResponse('Listing not found', 'NOT_FOUND', 404)
    }

    if (listing.landlordId !== user.id && user.role !== 'ADMIN') {
      return errorResponse('Not authorized', 'AUTHORIZATION_ERROR', 403)
    }

    const body = await request.json()

    // Validate update data
    const validationResult = updateListingSchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400, validationResult.error.flatten())
    }

    // Update listing
    const updated = await prisma.listing.update({
      where: { id },
      data: validationResult.data,
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            verificationStatus: true,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            createdAt: true,
          },
        },
      },
    })

    logger.info('Listing updated', { listingId: id, userId: user.id })
    return successResponse({ listing: updated })
  } catch (error) {
    logger.error('Update listing error', error)
    return handleAPIError(error)
  }
}

// Delete listing (landlord only, owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id } = await params

    if (!user) {
      return errorResponse('Not authenticated', 'AUTHENTICATION_ERROR', 401)
    }

    // Get listing and check ownership
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { landlordId: true },
    })

    if (!listing) {
      return errorResponse('Listing not found', 'NOT_FOUND', 404)
    }

    if (listing.landlordId !== user.id && user.role !== 'ADMIN') {
      return errorResponse('Not authorized', 'AUTHORIZATION_ERROR', 403)
    }

    // Soft delete - mark as deleted
    await prisma.listing.update({
      where: { id },
      data: { status: 'DELETED' },
    })

    logger.info('Listing deleted (soft)', { listingId: id, userId: user.id })
    return successResponse({ message: 'Listing deleted successfully' })
  } catch (error) {
    logger.error('Delete listing error', error)
    return handleAPIError(error)
  }
}



