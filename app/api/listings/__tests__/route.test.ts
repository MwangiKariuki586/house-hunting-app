// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'
import { NextRequest } from 'next/server'

// Mock next/server
vi.mock('next/server', () => {
    return {
        NextRequest: class extends Request {
            constructor(input: RequestInfo | URL, init?: RequestInit) {
                super(input, init)
            }
        },
        NextResponse: {
            json: (body: any, init?: ResponseInit) => {
                return Response.json(body, init)
            }
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

describe('Listings API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        prismaMock.listing.findMany.mockResolvedValue([])
        prismaMock.listing.count.mockResolvedValue(0)
    })

    it('should return listings with default parameters', async () => {
        const req = new NextRequest('http://localhost/api/listings')
        const res = await GET(req)
        const data = await res.json()

        expect(prismaMock.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { status: 'ACTIVE' },
            skip: 0,
            take: 12,
            orderBy: { createdAt: 'desc' }
        }))

        expect(data.listings).toEqual([])
        expect(data.pagination.page).toBe(1)
    })

    it('should filter by properties', async () => {
        const req = new NextRequest('http://localhost/api/listings?area=Westlands&propertyType=ONE_BEDROOM&minPrice=10000')
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
        const req = new NextRequest('http://localhost/api/listings?parking=true&petsAllowed=true')
        await GET(req)

        expect(prismaMock.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                parking: true,
                petsAllowed: true
            })
        }))
    })

    it('should sort listings', async () => {
        const req = new NextRequest('http://localhost/api/listings?sortBy=price_low')
        await GET(req)

        expect(prismaMock.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
            orderBy: { monthlyRent: 'asc' }
        }))
    })
})
