import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { demoPhotoPath, kenyanCatalogue, listingFitsMarketGuardrail } from './kenyan-catalogue'

describe('Kenyan rental catalogue', () => {
  it('contains the intended affordable Nairobi Metro mix', () => {
    expect(kenyanCatalogue).toHaveLength(24)
    expect(kenyanCatalogue.filter(({ monthlyRent }) => monthlyRent <= 25_000)).toHaveLength(18)
    expect(new Set(kenyanCatalogue.map(({ county, area }) => `${county}:${area}`)).size).toBeGreaterThanOrEqual(16)
  })

  it('keeps every rent inside its locality and property-type guardrail', () => {
    expect(kenyanCatalogue.every(listingFitsMarketGuardrail)).toBe(true)
  })

  it('uses truthful property combinations and one-month deposits', () => {
    for (const listing of kenyanCatalogue) {
      expect(listing.deposit).toBe(listing.monthlyRent)
      expect(listing.amenities).not.toContain('Swimming Pool')
      expect(listing.amenities).not.toContain('Gym')
      if (listing.monthlyRent <= 25_000) {
        expect(listing.parkingSpaces).toBe(0)
        expect(listing.buildingType).toBe('APARTMENT')
      }
    }
  })

  it('has three local images and a unique main image for every listing', () => {
    const mainImages = kenyanCatalogue.map(({ slug }) => demoPhotoPath(slug, 1))
    expect(new Set(mainImages).size).toBe(kenyanCatalogue.length)

    for (const listing of kenyanCatalogue) {
      for (const index of [1, 2, 3]) {
        const publicPath = demoPhotoPath(listing.slug, index)
        expect(publicPath).toMatch(/^\/images\/demo-listings\/.+\.webp$/)
        expect(existsSync(join(process.cwd(), 'public', publicPath.replace(/^\/images\//, 'images/')))).toBe(true)
      }
    }
  })

  it('avoids unsupported promotional language', () => {
    const copy = kenyanCatalogue.map(({ title, description }) => `${title} ${description}`).join(' ')
    expect(copy).not.toMatch(/\b(luxury|executive|prestigious|prime)\b/i)
  })
})
