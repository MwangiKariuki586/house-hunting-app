
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        if (user.role !== 'LANDLORD' && user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Only landlords can create listings' }, { status: 403 })
        }

        // Get full user data including verification info and listing count
        const [fullUser, listingCount] = await Promise.all([
            prisma.user.findUnique({
                where: { id: user.id },
                select: {
                    phoneVerified: true,
                    landlordVerification: {
                        select: {
                            status: true,
                            tier: true,
                        }
                    }
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
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check 1: Phone Verification
        if (!fullUser.phoneVerified) {
            return NextResponse.json({
                allowed: false,
                reason: 'PHONE_VERIFICATION_REQUIRED',
                message: 'Please verify your phone number to create listings'
            }, { status: 200 })
        }

        // Determine tier
        let currentTier = fullUser.landlordVerification?.tier || 'BASIC'
        const verificationStatus = fullUser.landlordVerification?.status || 'PENDING'

        // Legacy support: if verified status but low tier
        if (verificationStatus === 'VERIFIED' &&
            (currentTier === 'BASIC' || currentTier === 'PHONE_VERIFIED')) {
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

        // Check 2: Listing Limit
        if (user.role !== 'ADMIN' && listingCount >= listingLimit) {
            return NextResponse.json({
                allowed: false,
                reason: 'LISTING_LIMIT_REACHED',
                message: `You've reached the maximum of ${listingLimit} listings for your tier.`
            }, { status: 200 })
        }

        return NextResponse.json({ allowed: true }, { status: 200 })

    } catch (error) {
        console.error('Check limit error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
