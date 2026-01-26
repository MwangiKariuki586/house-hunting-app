// Get current user API route for VerifiedNyumba
import { getCurrentUser } from '@/app/lib/auth'
import { successResponse, errorResponse, handleAPIError } from '@/app/lib/api-response'
import { logger } from '@/app/lib/logger'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return errorResponse('Not authenticated', 'AUTHENTICATION_ERROR', 401)
    }

    return successResponse({ user })
  } catch (error) {
    logger.error('Get current user error', error)
    return handleAPIError(error)
  }
}



