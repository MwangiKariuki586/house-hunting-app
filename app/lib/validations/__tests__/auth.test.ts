import { describe, it, expect } from 'vitest'
import { registerSchema, loginSchema } from '../auth'

describe('Auth Validation Schemas', () => {
    describe('Register Schema', () => {
        it('should validate valid tenant registration data', () => {
            const validData = {
                email: 'test@example.com',
                phone: '0712345678',
                password: 'Password123',
                confirmPassword: 'Password123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'TENANT'
            }

            const result = registerSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should validate valid landlord registration data', () => {
            const validData = {
                email: 'landlord@example.com',
                phone: '0712345678',
                password: 'Password123',
                confirmPassword: 'Password123',
                firstName: 'Jane',
                lastName: 'Doe',
                role: 'LANDLORD'
            }

            const result = registerSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should reject mismatched passwords', () => {
            const invalidData = {
                email: 'test@example.com',
                phone: '0712345678',
                password: 'Password123',
                confirmPassword: 'DifferentPassword123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'TENANT'
            }

            const result = registerSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("Passwords don't match")
            }
        })

        it('should reject invalid Kenyan phone numbers', () => {
            const invalidData = {
                email: 'test@example.com',
                phone: '123456', // Too short
                password: 'Password123',
                confirmPassword: 'Password123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'TENANT'
            }

            const result = registerSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Please enter a valid Kenyan phone number')
            }
        })

        it('should reject weak passwords', () => {
            const invalidData = {
                email: 'test@example.com',
                phone: '0712345678',
                password: 'password', // No uppercase/number
                confirmPassword: 'password',
                firstName: 'John',
                lastName: 'Doe',
                role: 'TENANT'
            }

            const result = registerSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })
    })

    describe('Login Schema', () => {
        it('should validate valid login data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123'
            }

            const result = loginSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should reject invalid emails', () => {
            const invalidData = {
                email: 'not-an-email',
                password: 'password123'
            }

            const result = loginSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })
    })
})
