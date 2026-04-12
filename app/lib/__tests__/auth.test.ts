import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from '@/app/lib/auth'
import jwt from 'jsonwebtoken'

// Mock environment variables
const MOCK_JWT_SECRET = 'test-secret'
const MOCK_REFRESH_SECRET = 'test-refresh-secret'

vi.stubEnv('JWT_SECRET', MOCK_JWT_SECRET)
vi.stubEnv('JWT_REFRESH_SECRET', MOCK_REFRESH_SECRET)

describe('Auth Utilities', () => {
    describe('Password Hashing', () => {
        it('should hash a password correctly', async () => {
            const password = 'mySecurePassword123'
            const hash = await hashPassword(password)

            expect(hash).not.toBe(password)
            expect(hash).toHaveLength(60) // bcrypt hashes are 60 chars
        })

        it('should verify a correct password', async () => {
            const password = 'password123'
            const hash = await hashPassword(password)
            const isValid = await comparePassword(password, hash)

            expect(isValid).toBe(true)
        })

        it('should reject an incorrect password', async () => {
            const password = 'password123'
            const hash = await hashPassword(password)
            const isValid = await comparePassword('wrongpassword', hash)

            expect(isValid).toBe(false)
        })
    })

    describe('Token Generation', () => {
        const payload = {
            userId: 'user-123',
            email: 'test@example.com',
            role: 'TENANT'
        }

        it('should generate a valid access token', () => {
            const token = generateAccessToken(payload)
            expect(typeof token).toBe('string')

            const decoded = jwt.verify(token, MOCK_JWT_SECRET) as any
            expect(decoded.userId).toBe(payload.userId)
            expect(decoded.email).toBe(payload.email)
            expect(decoded.role).toBe(payload.role)
        })

        it('should generate a valid refresh token', () => {
            const token = generateRefreshToken(payload)
            expect(typeof token).toBe('string')

            const decoded = jwt.verify(token, MOCK_REFRESH_SECRET) as any
            expect(decoded.userId).toBe(payload.userId)
        })
    })
})
