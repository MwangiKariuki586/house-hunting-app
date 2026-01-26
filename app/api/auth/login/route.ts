// Login API route for VerifiedNyumba
import { NextRequest } from 'next/server'
import prisma from '@/app/lib/prisma'
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  setAuthCookies,
} from '@/app/lib/auth'
import { loginSchema } from '@/app/lib/validations/auth'
import { successResponse, errorResponse, handleAPIError } from '@/app/lib/api-response'
import { logger } from '@/app/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400, validationResult.error.flatten())
    }

    const { email, password } = validationResult.data

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return errorResponse('Invalid email or password', 'AUTHENTICATION_ERROR', 401)
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 'AUTHENTICATION_ERROR', 401)
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    // Store refresh token in database
    await storeRefreshToken(user.id, refreshToken)

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Set cookies
    await setAuthCookies(accessToken, refreshToken)

    // Return user data (excluding password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user

    logger.info('User logged in', { userId: user.id, role: user.role })

    return successResponse({
      message: 'Login successful',
      user: userWithoutPassword,
    })
  } catch (error) {
    logger.error('Login error', error)
    return handleAPIError(error)
  }
}



