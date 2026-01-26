import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiter
// Note: In production serverless environments (like Vercel), this should be replaced
// with an external store like Redis (Upstash) because memory is not shared.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

const WINDOW_SIZE = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS = 20 // 20 requests per window for auth routes

export function middleware(request: NextRequest) {
    // Only apply to auth routes
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
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
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/api/auth/:path*',
}
