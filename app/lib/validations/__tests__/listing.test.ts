import { describe, it, expect } from 'vitest'
import { createListingSchema } from '../listing'

describe('Listing Validation Schemas', () => {
    describe('Create Listing Schema', () => {
        const validListing = {
            title: 'Modern Apartment in Kilimani',
            description: 'A beautiful and spacious modern apartment located in the heart of Kilimani. 24/7 security and ample parking.'.padEnd(51, '.'),
            area: 'Kilimani',
            propertyType: 'TWO_BEDROOM',
            buildingType: 'APARTMENT',
            monthlyRent: 45000,
            deposit: 45000,
            bedrooms: 2,
            bathrooms: 2,
            waterType: 'COUNCIL',
            electricityType: 'TOKEN'
        }

        it('should validate a correct listing', () => {
            const result = createListingSchema.safeParse(validListing)
            expect(result.success).toBe(true)
        })

        it('should reject short titles', () => {
            const invalidListing = { ...validListing, title: 'Short' }
            const result = createListingSchema.safeParse(invalidListing)
            expect(result.success).toBe(false)
        })

        it('should reject short descriptions', () => {
            const invalidListing = { ...validListing, description: 'Too short' }
            const result = createListingSchema.safeParse(invalidListing)
            expect(result.success).toBe(false)
        })

        it('should reject low rent', () => {
            const invalidListing = { ...validListing, monthlyRent: 500 }
            const result = createListingSchema.safeParse(invalidListing)
            expect(result.success).toBe(false)
        })
    })
})
