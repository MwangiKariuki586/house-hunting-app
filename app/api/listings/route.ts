// Listings API route for VerifiedNyumba
import { NextRequest } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'
import { createListingSchema, listingFilterSchema } from '@/app/lib/validations/listing'
import { successResponse, errorResponse, handleAPIError } from '@/app/lib/api-response'
import { logger } from '@/app/lib/logger'

// Get listings with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse filters
    const filters = listingFilterSchema.parse({
      area: searchParams.get('area') || undefined,
      propertyType: searchParams.get('propertyType') || undefined,
      buildingType: searchParams.get('buildingType') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      waterType: searchParams.get('waterType') || undefined,
      electricityType: searchParams.get('electricityType') || undefined,
      parking: searchParams.get('parking') === 'true' ? true : undefined,
      petsAllowed: searchParams.get('petsAllowed') === 'true' ? true : undefined,
      familyFriendly: searchParams.get('familyFriendly') === 'true' ? true : undefined,
      bachelorFriendly: searchParams.get('bachelorFriendly') === 'true' ? true : undefined,
      gatedCommunity: searchParams.get('gatedCommunity') === 'true' ? true : undefined,
      furnished: searchParams.get('furnished') === 'true' ? true : undefined,
      verifiedLandlordOnly: searchParams.get('verifiedLandlordOnly') === 'true' ? true : undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 12,
      sortBy: (searchParams.get('sortBy') as 'newest' | 'price_low' | 'price_high' | 'popular') || 'newest',
    })

    // Build where clause
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
    }

    if (filters.area) where.area = filters.area
    if (filters.propertyType) where.propertyType = filters.propertyType
    if (filters.buildingType) where.buildingType = filters.buildingType
    if (filters.waterType) where.waterType = filters.waterType
    if (filters.electricityType) where.electricityType = filters.electricityType
    if (filters.parking) where.parking = true
    if (filters.petsAllowed) where.petsAllowed = true
    if (filters.familyFriendly) where.familyFriendly = true
    if (filters.bachelorFriendly) where.bachelorFriendly = true
    if (filters.gatedCommunity) where.gatedCommunity = true
    if (filters.furnished) where.furnished = true

    if (filters.minPrice || filters.maxPrice) {
      where.monthlyRent = {}
      if (filters.minPrice) (where.monthlyRent as Record<string, number>).gte = filters.minPrice
      if (filters.maxPrice) (where.monthlyRent as Record<string, number>).lte = filters.maxPrice
    }

    // Verified landlord filter
    if (filters.verifiedLandlordOnly) {
      where.landlord = { verificationStatus: 'VERIFIED' }
    }

    // Sorting
    let orderBy: Record<string, string> = { createdAt: 'desc' }
    switch (filters.sortBy) {
      case 'price_low':
        orderBy = { monthlyRent: 'asc' }
        break
      case 'price_high':
        orderBy = { monthlyRent: 'desc' }
        break
      case 'popular':
        orderBy = { viewCount: 'desc' }
        break
    }

    // Get total count
    const total = await prisma.listing.count({ where })

    // Get listings
    const listings = await prisma.listing.findMany({
      where,
      orderBy,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: {
        photos: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            verificationStatus: true,
          },
        },
      },
    })

    return successResponse({
      listings,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
      },
    })
  } catch (error) {
    logger.error('Failed to fetch listings', error)
    return handleAPIError(error)
  }
}

// Create new listing (landlord only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return errorResponse('Not authenticated', 'AUTHENTICATION_ERROR', 401)
    }

    if (user.role !== 'LANDLORD' && user.role !== 'ADMIN') {
      return errorResponse('Only landlords can create listings', 'AUTHORIZATION_ERROR', 403)
    }

    // Get full user data including verification info and listing count
    const [fullUser, listingCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          phoneVerified: true,
          verificationStatus: true,
        }
      }),
      prisma.listing.count({
        where: {
          landlordId: user.id,
          status: { not: 'DELETED' }
        }
      })
    ])

    if (!fullUser) {
      return errorResponse('User not found', 'NOT_FOUND', 404)
    }

    // Check if user can create listings (requires phone verification)
    if (!fullUser.phoneVerified) {
      return errorResponse(
        'Please verify your phone number to create listings',
        'PHONE_VERIFICATION_REQUIRED',
        403
      )
    }

    // Determine tier from verification status
    // Once new fields are added, this will use idVerified/propertyOwnerVerified instead
    let currentTier = 'PHONE_VERIFIED'
    if (fullUser.verificationStatus === 'VERIFIED') {
      currentTier = 'FULLY_VERIFIED'
    }

    // Define tier limits
    const tierLimits: Record<string, number> = {
      BASIC: 2,
      PHONE_VERIFIED: 5,
      ID_VERIFIED: 10,
      FULLY_VERIFIED: Infinity,
    }

    const listingLimit = tierLimits[currentTier] || 5

    // Check listing limit (admins bypass)
    if (user.role !== 'ADMIN' && listingCount >= listingLimit) {
      return errorResponse(
        `You've reached the maximum of ${listingLimit} listings for your tier. Upgrade your profile to create more listings.`,
        'LISTING_LIMIT_REACHED',
        403
      )
    }

    const body = await request.json()
    const { photos, ...listingData } = body

    // Validate listing data
    const validationResult = createListingSchema.safeParse(listingData)
    if (!validationResult.success) {
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400, validationResult.error.flatten())
    }

    // Validate photos
    if (!photos || photos.length < 3) {
      return errorResponse('At least 3 photos are required', 'VALIDATION_ERROR', 400)
    }

    // Create listing with photos
    const listing = await prisma.listing.create({
      data: {
        ...validationResult.data,
        landlordId: user.id,
        photos: {
          create: photos.map((photo: { url: string; publicId: string; isMain: boolean }, index: number) => ({
            url: photo.url,
            publicId: photo.publicId,
            order: index,
            isMain: photo.isMain,
          })),
        },
      },
      include: {
        photos: true,
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            verificationStatus: true,
          },
        },
      },
    })

    logger.info('New listing created', { listingId: listing.id, userId: user.id })
    return successResponse({ listing }, 201)
  } catch (error) {
    logger.error('Failed to create listing', error)
    return handleAPIError(error)
  }
}



