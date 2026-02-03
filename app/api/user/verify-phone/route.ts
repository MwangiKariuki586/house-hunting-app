// Phone Verification API for VerifiedNyumba
// Mocks SMS sending for development
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const body = await req.json()
        const { action, code, phoneNumber } = body

        // 1. Request OTP
        if (action === 'request') {
            const phoneToVerify = phoneNumber || user.phone
            if (!phoneToVerify) {
                return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
            }

            // TODO: Integrate real SMS provider
            console.log(`[DEV] OTP for ${phoneToVerify}: 123456`)

            // If user doesn't have a phone set, update it tentatively? 
            // For now we assume they verify the one on profile or provided one.
            if (phoneNumber && phoneNumber !== user.phone) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { phone: phoneNumber, phoneVerified: false }
                })
            }

            return NextResponse.json({ message: 'OTP sent', devCode: '123456' })
        }

        // 2. Verify OTP
        if (action === 'verify') {
            if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

            // MOCK VERIFICATION
            if (code !== '123456') {
                return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
            }

            // Update user status
            const dbUser = await prisma.user.findUnique({
                where: { id: user.id },
                include: { landlordVerification: true }
            });

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    phoneVerified: true,
                }
            })

            // If Landlord, update verification profile
            if (dbUser?.role === 'LANDLORD') {
                const currentTier = dbUser.landlordVerification?.tier || 'BASIC';
                // Upgrade to PHONE_VERIFIED if currently BASIC
                if (currentTier === 'BASIC') {
                    await prisma.landlordVerification.upsert({
                        where: { userId: user.id },
                        create: { userId: user.id, tier: 'PHONE_VERIFIED' },
                        update: { tier: 'PHONE_VERIFIED' }
                    });
                }
            }

            return NextResponse.json({ message: 'Phone verified successfully' })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error) {
        console.error('Phone verification error:', error)
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
    }
}
