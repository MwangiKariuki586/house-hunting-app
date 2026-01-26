import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

type ErrorCode =
    | 'VALIDATION_ERROR'
    | 'AUTHENTICATION_ERROR'
    | 'AUTHORIZATION_ERROR'
    | 'NOT_FOUND'
    | 'INTERNAL_SERVER_ERROR'
    | 'RATE_LIMIT_EXCEEDED'

interface APIErrorResponse {
    success: false
    error: {
        code: ErrorCode
        message: string
        details?: unknown
    }
}

interface APISuccessResponse<T> {
    success: true
    data: T
}

export function successResponse<T>(data: T, status = 200) {
    return NextResponse.json(
        { success: true, data } as APISuccessResponse<T>,
        { status }
    )
}

export function errorResponse(
    message: string,
    code: ErrorCode = 'INTERNAL_SERVER_ERROR',
    status = 500,
    details?: unknown
) {
    return NextResponse.json(
        {
            success: false,
            error: {
                code,
                message,
                details,
            },
        } as APIErrorResponse,
        { status }
    )
}

export function handleAPIError(error: unknown) {
    console.error('API Error:', error)

    if (error instanceof ZodError) {
        return errorResponse(
            'Validation failed',
            'VALIDATION_ERROR',
            400,
            error.flatten()
        )
    }

    if (error instanceof Error) {
        return errorResponse(error.message, 'INTERNAL_SERVER_ERROR', 500)
    }

    return errorResponse('An unexpected error occurred', 'INTERNAL_SERVER_ERROR', 500)
}
