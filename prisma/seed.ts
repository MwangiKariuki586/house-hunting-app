/**
 * Prisma Seed Script for VerifiedNyumba
 * 
 * This script populates the database with sample property listings
 * ranging from bedsitters to 4+ bedrooms across various Kenyan areas.
 * 
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Property type configurations with realistic pricing for Kenya (in KES)
const propertyConfigs = {
    BEDSITTER: {
        bedrooms: 0,
        bathrooms: 1,
        priceRange: { min: 6000, max: 20000 },
        depositMultiplier: 1,
    },
    STUDIO: {
        bedrooms: 0,
        bathrooms: 1,
        priceRange: { min: 12000, max: 35000 },
        depositMultiplier: 1,
    },
    ONE_BEDROOM: {
        bedrooms: 1,
        bathrooms: 1,
        priceRange: { min: 15000, max: 50000 },
        depositMultiplier: 1,
    },
    TWO_BEDROOM: {
        bedrooms: 2,
        bathrooms: 1,
        priceRange: { min: 25000, max: 80000 },
        depositMultiplier: 1.5,
    },
    THREE_BEDROOM: {
        bedrooms: 3,
        bathrooms: 2,
        priceRange: { min: 40000, max: 150000 },
        depositMultiplier: 2,
    },
    FOUR_PLUS_BEDROOM: {
        bedrooms: 4,
        bathrooms: 3,
        priceRange: { min: 80000, max: 300000 },
        depositMultiplier: 2,
    },
} as const

type PropertyType = keyof typeof propertyConfigs

// Building types available in Kenya
const buildingTypes = [
    'APARTMENT',
    'STANDALONE',
    'MABATI',
    'SERVANT_QUARTERS',
    'BUNGALOW',
    'MAISONETTE',
    'TOWNHOUSE',
] as const

type BuildingType = typeof buildingTypes[number]

// Kenyan areas with coordinates and pricing multipliers
const areas = [
    { name: 'Westlands', lat: -1.2666, lng: 36.8027, priceMultiplier: 1.8 },
    { name: 'Kilimani', lat: -1.2921, lng: 36.7871, priceMultiplier: 1.7 },
    { name: 'Lavington', lat: -1.2749, lng: 36.7682, priceMultiplier: 1.9 },
    { name: 'Kileleshwa', lat: -1.2835, lng: 36.7750, priceMultiplier: 1.6 },
    { name: 'Parklands', lat: -1.2612, lng: 36.8125, priceMultiplier: 1.5 },
    { name: 'Kasarani', lat: -1.2219, lng: 36.9005, priceMultiplier: 0.8 },
    { name: 'Roysambu', lat: -1.2193, lng: 36.8753, priceMultiplier: 0.75 },
    { name: 'Githurai', lat: -1.2021, lng: 36.9152, priceMultiplier: 0.6 },
    { name: 'Umoja', lat: -1.2786, lng: 36.8936, priceMultiplier: 0.65 },
    { name: 'Buruburu', lat: -1.2874, lng: 36.8765, priceMultiplier: 0.7 },
    { name: 'Donholm', lat: -1.2937, lng: 36.8872, priceMultiplier: 0.7 },
    { name: 'Embakasi', lat: -1.3189, lng: 36.8946, priceMultiplier: 0.65 },
    { name: 'South B', lat: -1.3074, lng: 36.8381, priceMultiplier: 0.9 },
    { name: 'South C', lat: -1.3147, lng: 36.8219, priceMultiplier: 1.0 },
    { name: 'Langata', lat: -1.3543, lng: 36.7612, priceMultiplier: 1.2 },
    { name: 'Karen', lat: -1.3287, lng: 36.7014, priceMultiplier: 2.2 },
    { name: 'Rongai', lat: -1.3962, lng: 36.7441, priceMultiplier: 0.5 },
    { name: 'Syokimau', lat: -1.3554, lng: 36.9281, priceMultiplier: 0.55 },
    { name: 'Kitengela', lat: -1.4697, lng: 36.9611, priceMultiplier: 0.45 },
    { name: 'Ruaka', lat: -1.2043, lng: 36.7763, priceMultiplier: 0.85 },
    { name: 'Kikuyu', lat: -1.2476, lng: 36.6592, priceMultiplier: 0.6 },
    { name: 'Nyali', lat: -4.0356, lng: 39.7219, priceMultiplier: 1.4 },
    { name: 'Bamburi', lat: -3.9876, lng: 39.7314, priceMultiplier: 0.9 },
]

// Sample estates by area
const estatesByArea: Record<string, string[]> = {
    Westlands: ['Brookside', 'Mountain View', 'Riverside Drive', 'Waiyaki Way'],
    Kilimani: ['Rose Avenue', 'Dennis Pritt', 'Argwings Kodhek', 'Lenana Road'],
    Lavington: ['Valley Arcade', 'James Gichuru', 'Mbaazi Lane', 'Kingara Road'],
    Kileleshwa: ['Othaya Road', 'Oloitokitok Road', 'Mandera Road', 'Gatundu Close'],
    Parklands: ['First Parklands', 'Second Parklands', 'Third Parklands', 'Limuru Road'],
    Kasarani: ['Mwiki', 'Hunters', 'Claycity', 'Seasons'],
    Roysambu: ['Garden Estate', 'Mirema', 'TRM', 'Marurui'],
    Githurai: ['Githurai 44', 'Githurai 45', 'Progressive', 'Kimbo'],
    Umoja: ['Umoja 1', 'Umoja 2', 'Innercore', 'Komarock'],
    Buruburu: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 5'],
    Donholm: ['Savannah', 'Greenfields', 'Harambee', 'Jacaranda'],
    Embakasi: ['Pipeline', 'Fedha', 'Transami', 'Mihango'],
    'South B': ['Kapiti', 'Golden Gate', 'Mariakani', 'Akiba'],
    'South C': ['Mugoya', 'Belle Vue', 'Red Cross', 'Nairobi West'],
    Langata: ['Otiende', 'Southlands', 'Hardy', 'Madaraka'],
    Karen: ['Karen Plains', 'Bogani', 'Dagoretti', 'Ngong Road'],
    Rongai: ['Nkoroi', 'Rimpa', 'Tuala', 'Gataka'],
    Syokimau: ['Gateway Mall', 'Katani', 'Mombasa Road', 'Airview'],
    Kitengela: ['EPZ', 'Milimani', 'Yukos', 'New Valley'],
    Ruaka: ['Two Rivers', 'Ndenderu', 'Banana', 'Rosslyn'],
    Kikuyu: ['Thogoto', 'Zambezi', 'Ondiri', 'Kerwa'],
    Nyali: ['Links Road', 'Nyali Beach', 'Greenwood', 'Ratna'],
    Bamburi: ['Mtopanga', 'Utange', 'Mkomani', 'Kisauni'],
}

// Property titles by type
const titlesByType: Record<PropertyType, string[]> = {
    BEDSITTER: [
        'Cozy Bedsitter in Prime Location',
        'Modern Bedsitter with Ensuite',
        'Spacious Bedsitter Near Amenities',
        'Budget-Friendly Bedsitter',
        'Newly Renovated Bedsitter',
        'Self-Contained Bedsitter Unit',
    ],
    STUDIO: [
        'Modern Studio Apartment',
        'Executive Studio with Balcony',
        'Furnished Studio Space',
        'Contemporary Studio Living',
        'Stylish Studio Apartment',
        'Open-Plan Studio Unit',
    ],
    ONE_BEDROOM: [
        'Elegant 1 Bedroom Apartment',
        'Modern 1BR with Master Ensuite',
        'Spacious 1 Bedroom Unit',
        'Newly Built 1 Bedroom Flat',
        'Cozy 1BR Near Shopping Center',
        'Executive 1 Bedroom Apartment',
    ],
    TWO_BEDROOM: [
        'Stunning 2 Bedroom Apartment',
        'Family-Friendly 2BR Unit',
        'Modern 2 Bedroom with DSQ',
        'Spacious 2BR Master Ensuite',
        'Well-Finished 2 Bedroom Flat',
        'Executive 2BR Apartment',
    ],
    THREE_BEDROOM: [
        'Luxurious 3 Bedroom Apartment',
        'Executive 3BR with DSQ',
        'Spacious 3 Bedroom Family Home',
        'Modern 3BR All Ensuite',
        'Premium 3 Bedroom Unit',
        'Beautiful 3BR with Garden',
    ],
    FOUR_PLUS_BEDROOM: [
        'Grand 4 Bedroom Mansion',
        'Exclusive 4BR Family Home',
        'Palatial 4 Bedroom Villa',
        'Stunning 4BR All Ensuite',
        'Executive 4+ Bedroom Residence',
        'Luxury 5 Bedroom Maisonette',
    ],
}

// Description templates
const descriptionTemplates = [
    `This beautiful {propertyType} property is located in the heart of {area}, {estate}. The unit features modern finishes, ample natural lighting, and is well-maintained. Enjoy easy access to local amenities including shopping centers, schools, and public transport. The property comes with 24-hour security and reliable water supply. Perfect for {audience}. Move in ready!`,

    `Discover this exceptional {propertyType} in {area}'s prestigious {estate} neighborhood. This well-designed unit offers a perfect blend of comfort and convenience. Features include quality tiling, fitted kitchen cabinets, and modern bathroom fixtures. The compound has ample parking, a backup generator, and round-the-clock security. Ideal for {audience} looking for quality housing.`,

    `Welcome to this stunning {propertyType} located in the desirable {estate} area of {area}. This property has been thoughtfully designed with spacious rooms, excellent ventilation, and quality finishes throughout. Residents enjoy access to reliable water, backup power, and secure parking. The location offers easy access to major roads and nearby shopping centers. Perfect for {audience}.`,

    `Experience comfortable living in this lovely {propertyType} situated in {area}, {estate}. The unit boasts a modern design with quality fixtures and fittings. Features include tiled floors, built-in wardrobes, and a fully fitted kitchen. The gated compound offers security, ample parking, and a serene living environment. Great for {audience} seeking a peaceful neighborhood.`,
]

// Amenities pool
const amenitiesPool = [
    'WiFi Ready',
    'DSTV Ready',
    'Hot Shower',
    'Balcony',
    'CCTV',
    'Security Guard',
    'Backup Generator',
    'Water Tank',
    'Laundry Area',
    'Intercom',
    'Borehole',
    'Gym',
    'Swimming Pool',
    'Playground',
    'Rooftop Access',
    'Lift/Elevator',
    'Solar Panels',
]

// Sample property photos (using Unsplash for demo - replace in production)
const photosByType: Record<PropertyType, string[]> = {
    BEDSITTER: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    ],
    STUDIO: [
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
        'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800',
    ],
    ONE_BEDROOM: [
        'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800',
        'https://images.unsplash.com/photo-1560185127-6a8c5c38dbd3?w=800',
        'https://images.unsplash.com/photo-1560185008-c5bc60a9d814?w=800',
    ],
    TWO_BEDROOM: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
    ],
    THREE_BEDROOM: [
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
        'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
    ],
    FOUR_PLUS_BEDROOM: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
        'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
    ],
}

// Helper functions
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
}

function randomSubset<T>(array: T[], min: number, max: number): T[] {
    const count = randomInt(min, max)
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}

function roundToNearest(value: number, nearest: number): number {
    return Math.round(value / nearest) * nearest
}

function generatePrice(propertyType: PropertyType, areaMultiplier: number): number {
    const config = propertyConfigs[propertyType]
    const basePrice = randomInt(config.priceRange.min, config.priceRange.max)
    const adjustedPrice = basePrice * areaMultiplier
    return roundToNearest(adjustedPrice, 500)
}

function generateDescription(
    propertyType: string,
    area: string,
    estate: string,
    bedrooms: number
): string {
    const template = randomChoice(descriptionTemplates)
    const audience = bedrooms >= 2 ? 'families' : 'working professionals or students'

    return template
        .replace('{propertyType}', propertyType.toLowerCase().replace('_', ' '))
        .replace('{area}', area)
        .replace('{estate}', estate)
        .replace('{audience}', audience)
}

async function main() {
    console.log('🏠 Starting VerifiedNyumba database seed...\n')

    // Clear existing data (optional - comment out if you want to append)
    console.log('🧹 Cleaning existing data...')
    await prisma.listingPhoto.deleteMany()
    await prisma.listing.deleteMany()
    await prisma.user.deleteMany()
    console.log('✅ Existing data cleared\n')

    // Create sample landlords
    console.log('👤 Creating sample landlords...')
    const landlords = []
    const landlordData = [
        { firstName: 'James', lastName: 'Mwangi', phone: '+254700000001', email: 'james.mwangi@example.com', verified: true },
        { firstName: 'Grace', lastName: 'Wanjiku', phone: '+254700000002', email: 'grace.wanjiku@example.com', verified: true },
        { firstName: 'Peter', lastName: 'Ochieng', phone: '+254700000003', email: 'peter.ochieng@example.com', verified: true },
        { firstName: 'Mary', lastName: 'Akinyi', phone: '+254700000004', email: 'mary.akinyi@example.com', verified: false },
        { firstName: 'John', lastName: 'Kamau', phone: '+254700000005', email: 'john.kamau@example.com', verified: true },
        { firstName: 'Sarah', lastName: 'Njeri', phone: '+254700000006', email: 'sarah.njeri@example.com', verified: false },
    ]

    const hashedPassword = await bcrypt.hash('password123', 10)

    for (const data of landlordData) {
        const landlord = await prisma.user.create({
            data: {
                email: data.email,
                phone: data.phone,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                role: 'LANDLORD',
                emailVerified: true,
                phoneVerified: true,
                landlordVerification: {
                    create: {
                        status: data.verified ? 'VERIFIED' : 'PENDING',
                        tier: data.verified ? 'FULLY_VERIFIED' : 'BASIC',
                        idVerified: data.verified,
                        propertyVerified: data.verified,
                        verifiedAt: data.verified ? new Date() : null,
                    }
                },
            },
        })
        landlords.push(landlord)
    }
    console.log(`✅ Created ${landlords.length} landlords\n`)

    // Create sample tenant
    console.log('👤 Creating sample tenant...')
    await prisma.user.create({
        data: {
            email: 'tenant@example.com',
            phone: '+254799999999',
            password: hashedPassword,
            firstName: 'Test',
            lastName: 'Tenant',
            role: 'TENANT',
            emailVerified: true,
            phoneVerified: true,
        },
    })
    console.log('✅ Created sample tenant\n')

    // Generate properties
    console.log('🏗️ Generating property listings...')
    const propertyTypes: PropertyType[] = [
        'BEDSITTER',
        'STUDIO',
        'ONE_BEDROOM',
        'TWO_BEDROOM',
        'THREE_BEDROOM',
        'FOUR_PLUS_BEDROOM',
    ]

    let totalListings = 0

    // Create 10-15 listings per property type for pagination testing
    for (const propertyType of propertyTypes) {
        const listingsCount = randomInt(10, 15)
        console.log(`  📦 Creating ${listingsCount} ${propertyType.replace('_', ' ')} listings...`)

        for (let i = 0; i < listingsCount; i++) {
            const area = randomChoice(areas)
            const estates = estatesByArea[area.name] || ['Main Estate']
            const estate = randomChoice(estates)
            const config = propertyConfigs[propertyType]
            const landlord = randomChoice(landlords)

            const monthlyRent = generatePrice(propertyType, area.priceMultiplier)
            const deposit = roundToNearest(monthlyRent * config.depositMultiplier, 500)

            // Determine appropriate building type based on property type
            let validBuildingTypes: BuildingType[]
            if (propertyType === 'BEDSITTER' || propertyType === 'STUDIO') {
                validBuildingTypes = ['APARTMENT', 'SERVANT_QUARTERS']
            } else if (propertyType === 'FOUR_PLUS_BEDROOM') {
                validBuildingTypes = ['STANDALONE', 'BUNGALOW', 'MAISONETTE', 'TOWNHOUSE']
            } else {
                validBuildingTypes = ['APARTMENT', 'STANDALONE', 'BUNGALOW', 'TOWNHOUSE']
            }
            const buildingType = randomChoice(validBuildingTypes)

            // Generate listing
            const listing = await prisma.listing.create({
                data: {
                    landlordId: landlord.id,
                    title: randomChoice(titlesByType[propertyType]),
                    description: generateDescription(
                        propertyType,
                        area.name,
                        estate,
                        config.bedrooms
                    ),
                    status: 'ACTIVE',
                    area: area.name,
                    estate: estate,
                    landmark: `Near ${randomChoice(['Shopping Center', 'Stage', 'School', 'Hospital', 'Mall', 'Mosque', 'Church'])}`,
                    latitude: area.lat + (Math.random() - 0.5) * 0.02,
                    longitude: area.lng + (Math.random() - 0.5) * 0.02,
                    distanceToCBD: Math.round((Math.abs(area.lat + 1.2921) + Math.abs(area.lng - 36.8219)) * 50 * 10) / 10,
                    distanceToStage: Math.round(Math.random() * 2 * 10) / 10,
                    propertyType: propertyType,
                    buildingType: buildingType,
                    bedrooms: config.bedrooms,
                    bathrooms: config.bathrooms,
                    monthlyRent: monthlyRent,
                    deposit: deposit,
                    serviceCharge: randomChoice([0, 500, 1000, 1500, 2000]),
                    waterCharge: randomChoice([0, 300, 500, 800]),
                    garbageCharge: randomChoice([0, 100, 200, 300]),
                    waterType: randomChoice(['BOREHOLE', 'COUNCIL', 'BOTH']),
                    electricityType: randomChoice(['TOKEN', 'POSTPAID']),
                    parking: Math.random() > 0.3,
                    parkingSpaces: propertyType === 'BEDSITTER' || propertyType === 'STUDIO' ? 0 : randomInt(0, 2),
                    petsAllowed: Math.random() > 0.7,
                    familyFriendly: config.bedrooms >= 2,
                    bachelorFriendly: config.bedrooms <= 1,
                    gatedCommunity: Math.random() > 0.4,
                    furnished: Math.random() > 0.8,
                    amenities: randomSubset(amenitiesPool, 3, 8),
                    viewCount: randomInt(10, 500),
                },
            })

            // Add photos
            const photos = photosByType[propertyType]
            for (let j = 0; j < photos.length; j++) {
                await prisma.listingPhoto.create({
                    data: {
                        listingId: listing.id,
                        url: photos[j],
                        publicId: `seed_${listing.id}_${j}`,
                        order: j,
                        isMain: j === 0,
                    },
                })
            }

            totalListings++
        }
    }

    console.log(`\n✅ Created ${totalListings} property listings\n`)

    // Summary
    console.log('📊 Seed Summary:')
    console.log('================')
    console.log(`   Landlords: ${landlords.length}`)
    console.log(`   Tenants: 1`)
    console.log(`   Listings: ${totalListings}`)
    console.log('\n🎉 Database seeding completed successfully!')
    console.log('\n📝 Login credentials:')
    console.log('   Landlord: james.mwangi@example.com / password123')
    console.log('   Tenant: tenant@example.com / password123')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
