/**
 * Auth Error Types and Classes
 * 
 * Provides typed errors for authentication operations with:
 * - Specific error codes for debugging
 * - User-friendly messages for display
 * - Structured logging support
 */

// Auth error codes for precise error identification
export type AuthErrorCode =
    | 'INVALID_CREDENTIALS'      // Wrong email/password combination
    | 'USER_NOT_FOUND'           // Email doesn't exist in database
    | 'USER_ALREADY_EXISTS'      // Duplicate email or phone during registration
    | 'PHONE_ALREADY_EXISTS'     // Duplicate phone number
    | 'INVALID_TOKEN'            // Malformed or tampered token
    | 'TOKEN_EXPIRED'            // Token past expiration date
    | 'TOKEN_ALREADY_USED'       // Password reset token already consumed
    | 'ACCOUNT_LOCKED'           // Too many failed attempts
    | 'EMAIL_NOT_VERIFIED'       // Email verification required
    | 'VALIDATION_ERROR'         // Input validation failed
    | 'PASSWORD_TOO_WEAK'        // Password doesn't meet requirements
    | 'DATABASE_ERROR'           // Prisma/MongoDB operation failed
    | 'EMAIL_SEND_FAILED'        // Failed to send email
    | 'INTERNAL_ERROR'           // Unexpected server error

// Mapping of error codes to user-friendly messages
// These are safe to show to users
const USER_MESSAGES: Record<AuthErrorCode, string> = {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'Invalid email or password', // Don't reveal if email exists
    USER_ALREADY_EXISTS: 'A user with this email already exists',
    PHONE_ALREADY_EXISTS: 'A user with this phone number already exists',
    INVALID_TOKEN: 'This link is invalid or has been tampered with',
    TOKEN_EXPIRED: 'This link has expired. Please request a new one',
    TOKEN_ALREADY_USED: 'This link has already been used',
    ACCOUNT_LOCKED: 'Account temporarily locked. Please try again later',
    EMAIL_NOT_VERIFIED: 'Please verify your email address first',
    VALIDATION_ERROR: 'Please check your input and try again',
    PASSWORD_TOO_WEAK: 'Password does not meet security requirements',
    DATABASE_ERROR: 'An error occurred. Please try again',
    EMAIL_SEND_FAILED: 'Failed to send email. Please try again',
    INTERNAL_ERROR: 'An unexpected error occurred. Please try again',
}

/**
 * Custom error class for authentication errors
 * Includes both technical details for logging and user-safe messages
 */
export class AuthError extends Error {
    public readonly code: AuthErrorCode
    public readonly userMessage: string
    public readonly context?: Record<string, unknown>

    constructor(
        code: AuthErrorCode,
        technicalMessage?: string,
        context?: Record<string, unknown>
    ) {
        // Technical message for logging (not shown to users)
        super(technicalMessage || USER_MESSAGES[code])
        this.name = 'AuthError'
        this.code = code
        this.userMessage = USER_MESSAGES[code]
        this.context = context

        // Maintains proper stack trace for V8 engines
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AuthError)
        }
    }

    /**
     * Convert to a safe object for client response
     * Excludes technical details and stack trace
     */
    toClientResponse() {
        return {
            error: this.userMessage,
            code: this.code,
            timestamp: Date.now(),
        }
    }

    /**
     * Convert to a detailed object for server logging
     * Includes all context for debugging
     */
    toLogEntry() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            userMessage: this.userMessage,
            context: this.context,
            stack: this.stack,
        }
    }
}

/**
 * Type guard to check if an error is an AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
    return error instanceof AuthError
}

/**
 * Parse Prisma errors into AuthErrors
 * Handles common database error codes
 */
export function parsePrismaError(error: unknown): AuthError {
    // Check for Prisma unique constraint violation
    if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002'
    ) {
        const meta = 'meta' in error ? (error.meta as { target?: string[] }) : null
        const target = meta?.target?.[0]

        if (target === 'email') {
            return new AuthError('USER_ALREADY_EXISTS', 'Duplicate email in database', { field: 'email' })
        }
        if (target === 'phone') {
            return new AuthError('PHONE_ALREADY_EXISTS', 'Duplicate phone in database', { field: 'phone' })
        }

        return new AuthError('USER_ALREADY_EXISTS', 'Duplicate field in database', { target })
    }

    // Generic database error
    return new AuthError(
        'DATABASE_ERROR',
        error instanceof Error ? error.message : 'Unknown database error',
        { originalError: String(error) }
    )
}
