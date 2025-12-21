// Utility functions for VerifiedNyumba
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price in KES
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Calculate total move-in cost
export function calculateMoveInCost(listing: {
  monthlyRent: number
  deposit: number
  serviceCharge?: number
  waterCharge?: number
  garbageCharge?: number
}): number {
  return (
    listing.monthlyRent +
    listing.deposit +
    (listing.serviceCharge || 0) +
    (listing.waterCharge || 0) +
    (listing.garbageCharge || 0)
  )
}

// Format date for display
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(date)
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// Generate initials from name
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

// Property type display names
export const propertyTypeLabels: Record<string, string> = {
  BEDSITTER: 'Bedsitter',
  STUDIO: 'Studio',
  ONE_BEDROOM: '1 Bedroom',
  TWO_BEDROOM: '2 Bedroom',
  THREE_BEDROOM: '3 Bedroom',
  FOUR_PLUS_BEDROOM: '4+ Bedroom',
}

// Building type display names
export const buildingTypeLabels: Record<string, string> = {
  APARTMENT: 'Apartment',
  STANDALONE: 'Standalone',
  MABATI: 'Mabati',
  SERVANT_QUARTERS: 'Servant Quarters',
  BUNGALOW: 'Bungalow',
  MAISONETTE: 'Maisonette',
  TOWNHOUSE: 'Townhouse',
}

// Water type display names
export const waterTypeLabels: Record<string, string> = {
  BOREHOLE: 'Borehole',
  COUNCIL: 'Council Water',
  BOTH: 'Borehole & Council',
  NONE: 'No Running Water',
}

// Electricity type display names
export const electricityTypeLabels: Record<string, string> = {
  TOKEN: 'Token (Prepaid)',
  POSTPAID: 'Postpaid',
  NONE: 'No Electricity',
}

// Verification status display
export const verificationStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'yellow' },
  UNDER_REVIEW: { label: 'Under Review', color: 'blue' },
  VERIFIED: { label: 'Verified', color: 'green' },
  REJECTED: { label: 'Rejected', color: 'red' },
}

// Slugify text for URLs
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Generate random string for IDs
export function generateId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Debounce function
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}



