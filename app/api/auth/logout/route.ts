// Logout API route for VerifiedNyumba
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { removeRefreshToken, clearAuthCookies } from '@/app/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refreshToken')?.value

    // Remove refresh token from database if it exists
    if (refreshToken) {
      await removeRefreshToken(refreshToken)
    }

    // Clear cookies
    await clearAuthCookies()

    return NextResponse.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    // Still clear cookies even if there's an error
    await clearAuthCookies()
    return NextResponse.json({ message: 'Logout successful' })
  }
}



