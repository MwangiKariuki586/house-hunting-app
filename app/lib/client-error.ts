import { ZodError } from 'zod'

export type ClientErrorPresentation = {
  title: string
  message: string
  referenceId?: string
}

const DEFAULT_PRESENTATION: ClientErrorPresentation = {
  title: 'Something went wrong',
  message: 'We ran into a temporary issue. Please try again in a moment.',
}

export function formatErrorForClient(error: unknown): ClientErrorPresentation {
  if (error instanceof ZodError) {
    return {
      title: 'Please check your input',
      message: 'Some of the information provided is invalid. Review the form and try again.',
    }
  }

  if (error instanceof Error) {
    const digest = 'digest' in error && typeof error.digest === 'string'
      ? error.digest
      : undefined

    const message = error.message.toLowerCase()

    if (
      message.includes('prisma') ||
      message.includes('database') ||
      message.includes('does not exist') ||
      message.includes('relation') ||
      message.includes('table')
    ) {
      return {
        title: 'Service temporarily unavailable',
        message: 'We are updating part of the system. Please refresh and try again shortly.',
        referenceId: digest,
      }
    }

    return {
      ...DEFAULT_PRESENTATION,
      referenceId: digest,
    }
  }

  return DEFAULT_PRESENTATION
}

export function getSafeApiErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return 'Please review your input and try again.'
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (
      message.includes('not found') ||
      message.includes('unauthorized') ||
      message.includes('forbidden')
    ) {
      return 'The requested action could not be completed.'
    }

    if (
      message.includes('prisma') ||
      message.includes('database') ||
      message.includes('does not exist') ||
      message.includes('relation') ||
      message.includes('table')
    ) {
      return 'We are having trouble loading data right now. Please try again shortly.'
    }
  }

  return 'An unexpected error occurred. Please try again.'
}
