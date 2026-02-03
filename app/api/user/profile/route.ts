// User Profile API endpoint for VerifiedNyumba
// Returns current user's profile data including verification status

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export async function GET() {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: {
                id: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
                emailVerified: true,
                phoneVerified: true,
                landlordVerification: {
                    select: {
                        status: true,
                        tier: true,
                    }
                },
                createdAt: true,
                _count: {
                    select: {
                        listings: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Flatten for frontend
        return NextResponse.json({
            ...user,
            verificationStatus: user.landlordVerification?.status || 'PENDING',
            profileTier: user.landlordVerification?.tier || 'BASIC',
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}
