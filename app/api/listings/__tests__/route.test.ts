
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'


// Mock next/server
vi.mock('next/server', () => {
    return {
        NextRequest: class extends Request { },
        NextResponse: {
            json: (body: unknown, init?: ResponseInit) => ({
                json: async () => body,
                status: init?.status || 200,
                ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
            })
        }
    }
})

// Mock Prisma
const { prismaMock } = vi.hoisted(() => ({
    prismaMock: {
        listing: {
            findMany: vi.fn(),
            count: vi.fn(),
        },
    },
}))

vi.mock('@/app/lib/prisma', () => ({
    default: prismaMock,
}))

vi.mock('@/app/lib/auth', () => ({
    getCurrentUser: vi.fn().mockResolvedValue({ id: 'user-123', role: 'TENANT' }),
}))

// Mock logger to avoid cluttering test output
vi.mock('@/app/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    }
}))

describe('Listings API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        prismaMock.listing.findMany.mockResolvedValue([])
        prismaMock.listing.count.mockResolvedValue(0)
    })

    it('should return listings with default parameters', async () => {
        const req = new Request('http://localhost/api/listings') as Parameters<typeof GET>[0]
        const res = await GET(req)
        const json = await res.json()

        expect(prismaMock.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { status: 'ACTIVE' },
            skip: 0,
            take: 12,
            orderBy: { createdAt: 'desc' }
        }))

        expect(json.success).toBe(true)
        expect(json.data.listings).toEqual([])
        expect(json.data.pagination.page).toBe(1)
    })

    it('should filter by properties', async () => {
        const req = new Request('http://localhost/api/listings?county=Kiambu&area=Ruiru&propertyType=ONE_BEDROOM&minPrice=10000') as Parameters<typeof GET>[0]
        await GET(req)

        expect(prismaMock.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                status: 'ACTIVE',
                county: 'Kiambu',
                area: 'Ruiru',
                propertyType: 'ONE_BEDROOM',
                monthlyRent: expect.objectContaining({
                    gte: 10000
                })
            })
        }))
    })

    it('should handle boolean filters correctly', async () => {
        const req = new Request('http://localhost/api/listings?parking=true&petsAllowed=true') as Parameters<typeof GET>[0]
        await GET(req)

        expect(prismaMock.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                parking: true,
                petsAllowed: true
            })
        }))
    })

    it('should sort listings', async () => {
        const req = new Request('http://localhost/api/listings?sortBy=price_low') as Parameters<typeof GET>[0]
        await GET(req)

        expect(prismaMock.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
            orderBy: { monthlyRent: 'asc' }
        }))
    })

    it('does not expose the internal demo flag', async () => {
        prismaMock.listing.findMany.mockResolvedValue([{
            id: 'listing-1',
            title: 'Bedsitter near Mwiki Stage',
            isDemo: true,
            landlord: { landlordVerification: { status: 'VERIFIED' } },
        }])
        const res = await GET(new Request('http://localhost/api/listings') as Parameters<typeof GET>[0])
        const json = await res.json()

        expect(json.data.listings[0]).not.toHaveProperty('isDemo')
    })
})
