// Registration API route for VerifiedNyumba
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import {
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  setAuthCookies,
} from '@/app/lib/auth'
import { registerSchema, formatKenyanPhone } from '@/app/lib/validations/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { email, phone, password, firstName, lastName, role } = validationResult.data

    // Format phone number to international format
    const formattedPhone = formatKenyanPhone(phone)

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { phone: formattedPhone }],
      },
    })

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'phone'
      return NextResponse.json(
        { error: `A user with this ${field} already exists` },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        phone: formattedPhone,
        password: hashedPassword,
        firstName,
        lastName,
        role: role as 'TENANT' | 'LANDLORD',
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        verificationStatus: true,
        createdAt: true,
      },
    })

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

    // Set cookies
    await setAuthCookies(accessToken, refreshToken)

    return NextResponse.json(
      {
        message: 'Registration successful',
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}



