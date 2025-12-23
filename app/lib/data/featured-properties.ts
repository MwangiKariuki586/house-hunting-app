/**
 * Mock Data - Featured Properties
 * 
 * This file contains placeholder property data used for development and 
 * initial UI rendering. In production, this data would be fetched from 
 * the API via the /api/listings endpoint.
 * 
 * TODO: Replace with real API calls once the backend is fully integrated.
 */

export interface FeaturedProperty {
    id: string;
    title: string;
    area: string;
    estate: string;
    propertyType: string;
    monthlyRent: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    parking: boolean;
    parkingSpaces?: number;
    photos: Array<{
        url: string;
        isMain: boolean;
    }>;
    isVerifiedLandlord: boolean;
}

export const featuredProperties: FeaturedProperty[] = [
    {
        id: "1",
        title: "Luxury Modern Villa",
        area: "Westlands",
        estate: "Brookside Grove",
        propertyType: "THREE_BEDROOM",
        monthlyRent: 175000,
        bedrooms: 3,
        bathrooms: 2,
        sqft: 2500,
        parking: true,
        parkingSpaces: 2,
        photos: [
            {
                url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
                isMain: true,
            },
        ],
        isVerifiedLandlord: true,
    },
    {
        id: "2",
        title: "Cozy Lakeside Cabin",
        area: "Karen",
        estate: "Langata Road",
        propertyType: "TWO_BEDROOM",
        monthlyRent: 95000,
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1800,
        parking: true,
        parkingSpaces: 1,
        photos: [
            {
                url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
                isMain: true,
            },
        ],
        isVerifiedLandlord: true,
    },
    {
        id: "3",
        title: "Scandinavian Loft Home",
        area: "Kilimani",
        estate: "Rose Avenue",
        propertyType: "ONE_BEDROOM",
        monthlyRent: 65000,
        bedrooms: 1,
        bathrooms: 1,
        sqft: 950,
        parking: true,
        photos: [
            {
                url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
                isMain: true,
            },
        ],
        isVerifiedLandlord: false,
    },
    {
        id: "4",
        title: "Smart Ridge House",
        area: "Lavington",
        estate: "Valley Arcade",
        propertyType: "FOUR_PLUS_BEDROOM",
        monthlyRent: 250000,
        bedrooms: 4,
        bathrooms: 3,
        sqft: 3200,
        parking: true,
        parkingSpaces: 3,
        photos: [
            {
                url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
                isMain: true,
            },
        ],
        isVerifiedLandlord: true,
    },
];
