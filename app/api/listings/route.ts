// Listings API route for VerifiedNyumba
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'
import { createListingSchema, listingFilterSchema } from '@/app/lib/validations/listing'

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

    return NextResponse.json({
      listings,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
      },
    })
  } catch (error) {
    console.error('Get listings error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

// Create new listing (landlord only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (user.role !== 'LANDLORD' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only landlords can create listings' }, { status: 403 })
    }

    const body = await request.json()
    const { photos, ...listingData } = body

    // Validate listing data
    const validationResult = createListingSchema.safeParse(listingData)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    // Validate photos
    if (!photos || photos.length < 3) {
      return NextResponse.json(
        { error: 'At least 3 photos are required' },
        { status: 400 }
      )
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

    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    console.error('Create listing error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

