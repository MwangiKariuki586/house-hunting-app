import { describe, it, expect } from 'vitest'
import { successResponse, errorResponse, handleAPIError } from '../api-response'
import { z, ZodError } from 'zod'

describe('API Response Utilities', () => {
    it('should create success response', async () => {
        const data = { id: 1, name: 'Test' }
        const response = successResponse(data)
        const json = await response.json()

        expect(response.status).toBe(200)
        expect(json).toEqual({
            success: true,
            data
        })
    })

    it('should create error response', async () => {
        const response = errorResponse('Bad Request', 'VALIDATION_ERROR', 400)
        const json = await response.json()

        expect(response.status).toBe(400)
        expect(json).toEqual({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Bad Request'
            }
        })
    })

    it('should handle Zod errors', async () => {
        const result = z.object({ email: z.string() }).safeParse({ email: 123 })

        expect(result.success).toBe(false)

        const zodError = (result as { success: false; error: ZodError }).error

        const response = handleAPIError(zodError)
        const json = await response.json()

        expect(response.status).toBe(400)
        expect(json.error.code).toBe('VALIDATION_ERROR')
        expect(json.error.details).toBeDefined()
    })

    it('should handle standard errors', async () => {
        const error = new Error('Database connection failed')
        const response = handleAPIError(error)
        const json = await response.json()

        expect(response.status).toBe(500)
        expect(json.error.code).toBe('INTERNAL_SERVER_ERROR')
        expect(json.error.message).toBe('We are having trouble loading data right now. Please try again shortly.')
    })
})
