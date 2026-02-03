import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Routes that require authentication
const protectedRoutes = [
    '/api/landlord',
    '/api/listings',
    '/api/user',
    '/api/conversations',
    '/api/messages',
    '/api/saved',
    '/landlord',
    '/tenant',
    '/messages',
    '/saved',
    '/settings',
]

// Routes that are public
const publicRoutes = [
    '/api/auth',
    '/api/listings', // GET is public, POST requires auth (handled in route)
    '/login',
    '/register',
    '/properties',
    '/',
]

// Simple in-memory rate limiter for auth routes
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()
const WINDOW_SIZE = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS = 20 // 20 requests per window for auth routes

function isProtectedRoute(pathname: string): boolean {
    // Check if it's a protected API route
    if (pathname.startsWith('/api/')) {
        // Public API routes
        if (pathname.startsWith('/api/auth')) return false
        if (pathname === '/api/listings' || pathname.match(/^\/api\/listings\/[^/]+$/)) return false // GET single listing is public

        // All other API routes are protected
        return protectedRoutes.some(route => pathname.startsWith(route))
    }

    // Check if it's a protected page route
    return protectedRoutes.some(route => pathname.startsWith(route))
}

async function verifyAccessToken(token: string) {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        const { payload } = await jwtVerify(token, secret)
        return payload
    } catch {
        return null
    }
}

async function verifyRefreshToken(token: string): Promise<boolean> {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET)
        await jwtVerify(token, secret)
        return true
    } catch {
        return false
    }
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Rate limiting for auth routes
    if (pathname.startsWith('/api/auth')) {
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        const now = Date.now()

        const record = rateLimitMap.get(ip) || { count: 0, lastReset: now }

        // Reset window if passed
        if (now - record.lastReset > WINDOW_SIZE) {
            record.count = 0
            record.lastReset = now
        }

        // Check limit
        if (record.count >= MAX_REQUESTS) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'RATE_LIMIT_EXCEEDED',
                        message: 'Too many requests, please try again later.'
                    }
                },
                { status: 429 }
            )
        }

        // Increment
        record.count++
        rateLimitMap.set(ip, record)

        return NextResponse.next()
    }

    // Redirect authenticated users away from auth pages
    const isAuthPage = ['/login', '/register'].includes(pathname)
    if (isAuthPage) {
        const accessToken = request.cookies.get('accessToken')?.value
        if (accessToken) {
            const payload = await verifyAccessToken(accessToken)
            if (payload) {
                const role = payload.role as string
                if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url))
                if (role === 'LANDLORD') return NextResponse.redirect(new URL('/landlord/listings', request.url))
                return NextResponse.redirect(new URL('/', request.url))
            }
        }
    }

    // Check if route needs authentication
    if (!isProtectedRoute(pathname)) {
        return NextResponse.next()
    }

    // Get tokens from cookies
    const accessToken = request.cookies.get('accessToken')?.value
    const refreshToken = request.cookies.get('refreshToken')?.value

    // If no tokens at all, redirect to login (for pages) or return 401 (for API)
    if (!accessToken && !refreshToken) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify access token
    if (accessToken && await verifyAccessToken(accessToken)) {
        // Access token is valid, proceed
        return NextResponse.next()
    }

    // Access token is missing or expired, try to refresh
    if (refreshToken && await verifyRefreshToken(refreshToken)) {
        try {
            // Call refresh endpoint internally
            const refreshUrl = new URL('/api/auth/refresh', request.url)
            const refreshResponse = await fetch(refreshUrl.toString(), {
                method: 'POST',
                headers: {
                    'Cookie': `refreshToken=${refreshToken}`,
                },
            })

            if (refreshResponse.ok) {
                // Get new cookies from refresh response
                const setCookieHeader = refreshResponse.headers.get('set-cookie')

                // Create response and forward cookies
                const response = NextResponse.next()

                if (setCookieHeader) {
                    // Parse and set each cookie
                    const cookies = setCookieHeader.split(',').map(c => c.trim())
                    cookies.forEach(cookie => {
                        response.headers.append('set-cookie', cookie)
                    })
                }

                return response
            }
        } catch (error) {
            console.error('Token refresh in middleware failed:', error)
        }
    }

    // Refresh failed, clear cookies and redirect
    const response = pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Session expired' }, { status: 401 })
        : NextResponse.redirect(new URL('/login', request.url))

    // Clear invalid cookies
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')

    return response
}

export const config = {
    matcher: [
        // Match all routes except static files
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
