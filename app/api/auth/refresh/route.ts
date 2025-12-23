// Token refresh API route for VerifiedNyumba
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/app/lib/prisma'
import {
  verifyRefreshToken,
  validateStoredRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  removeRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from '@/app/lib/auth'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      )
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      await clearAuthCookies()
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      )
    }

    // Validate token exists in database
    const isValid = await validateStoredRefreshToken(refreshToken)
    if (!isValid) {
      await clearAuthCookies()
      return NextResponse.json(
        { error: 'Refresh token not found or expired' },
        { status: 401 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    })

    if (!user) {
      await clearAuthCookies()
      await removeRefreshToken(refreshToken)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Generate new tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const newAccessToken = generateAccessToken(tokenPayload)
    const newRefreshToken = generateRefreshToken(tokenPayload)

    // Remove old refresh token and store new one
    await removeRefreshToken(refreshToken)
    await storeRefreshToken(user.id, newRefreshToken)

    // Set new cookies
    await setAuthCookies(newAccessToken, newRefreshToken)

    return NextResponse.json({ message: 'Tokens refreshed successfully' })
  } catch (error) {
    console.error('Token refresh error:', error)
    await clearAuthCookies()
    return NextResponse.json(
      { error: 'An error occurred during token refresh' },
      { status: 500 }
    )
  }
}



