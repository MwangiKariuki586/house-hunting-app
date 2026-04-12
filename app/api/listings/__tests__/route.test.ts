
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'


// Mock next/server
vi.mock('next/server', () => {
    return {
        NextRequest: class extends Request { },
        NextResponse: {
            json: (body: any, init?: any) => ({
                json: async () => body,
                status: init?.status || 200,
                ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
            })
        }
    }
})

// Mock Prisma
const prismaMock = {
    listing: {
        findMany: vi.fn(),
        count: vi.fn(),
    },
}

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
        const req = new Request('http://localhost/api/listings') as any
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
        const req = new Request('http://localhost/api/listings?area=Westlands&propertyType=ONE_BEDROOM&minPrice=10000') as any
        await GET(req)

        expect(prismaMock.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                status: 'ACTIVE',
                area: 'Westlands',
                propertyType: 'ONE_BEDROOM',
                monthlyRent: expect.objectContaining({
                    gte: 10000
                })
            })
        }))
    })

    it('should handle boolean filters correctly', async () => {
        const req = new Request('http://localhost/api/listings?parking=true&petsAllowed=true') as any
        await GET(req)

        expect(prismaMock.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                parking: true,
                petsAllowed: true
            })
        }))
    })

    it('should sort listings', async () => {
        const req = new Request('http://localhost/api/listings?sortBy=price_low') as any
        await GET(req)

        expect(prismaMock.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
            orderBy: { monthlyRent: 'asc' }
        }))
    })
})
