/** Deterministic, non-destructive seed for the pre-launch Nairobi Metro catalogue. */
import { PrismaClient, type PropertyType, type BuildingType, type WaterType, type ElectricityType } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { demoPhotoPath, kenyanCatalogue, listingFitsMarketGuardrail } from './kenyan-catalogue'

const prisma = new PrismaClient()

const landlordData = [
  { firstName: 'James', lastName: 'Mwangi', phone: '+254700000001', email: 'james.mwangi@example.com' },
  { firstName: 'Grace', lastName: 'Wanjiku', phone: '+254700000002', email: 'grace.wanjiku@example.com' },
  { firstName: 'Peter', lastName: 'Ochieng', phone: '+254700000003', email: 'peter.ochieng@example.com' },
  { firstName: 'Mary', lastName: 'Akinyi', phone: '+254700000004', email: 'mary.akinyi@example.com' },
  { firstName: 'John', lastName: 'Kamau', phone: '+254700000005', email: 'john.kamau@example.com' },
  { firstName: 'Sarah', lastName: 'Njeri', phone: '+254700000006', email: 'sarah.njeri@example.com' },
]

async function main() {
  console.log('Refreshing the VerifiedNyumba demo catalogue...')
  const affordableCount = kenyanCatalogue.filter(({ monthlyRent }) => monthlyRent <= 25_000).length
  if (kenyanCatalogue.length !== 24 || affordableCount !== 18 || !kenyanCatalogue.every(listingFitsMarketGuardrail)) {
    throw new Error('The curated catalogue does not meet its count, affordability, or market-band requirements.')
  }
  const hashedPassword = await bcrypt.hash('password123', 10)

  const landlords = []
  for (const data of landlordData) {
    const landlord = await prisma.user.upsert({
      where: { email: data.email },
      update: { firstName: data.firstName, lastName: data.lastName, emailVerified: true, phoneVerified: true },
      create: { ...data, password: hashedPassword, role: 'LANDLORD', emailVerified: true, phoneVerified: true },
    })
    await prisma.landlordVerification.upsert({
      where: { userId: landlord.id },
      update: { status: 'VERIFIED', tier: 'FULLY_VERIFIED', completeness: 100, idVerified: true, propertyVerified: true, verifiedAt: new Date() },
      create: { userId: landlord.id, status: 'VERIFIED', tier: 'FULLY_VERIFIED', completeness: 100, idVerified: true, propertyVerified: true, verifiedAt: new Date() },
    })
    landlords.push(landlord)
  }

  await prisma.user.upsert({
    where: { email: 'tenant@example.com' },
    update: { emailVerified: true, phoneVerified: true },
    create: { email: 'tenant@example.com', phone: '+254799999999', password: hashedPassword, firstName: 'Test', lastName: 'Tenant', role: 'TENANT', emailVerified: true, phoneVerified: true },
  })

  const legacySeedIds = await prisma.listing.findMany({
    where: {
      OR: [
        { isDemo: true },
        { landlord: { email: { endsWith: '@example.com' } }, photos: { some: { publicId: { startsWith: 'seed_' } } } },
      ],
    },
    select: { id: true },
  })
  await prisma.listing.deleteMany({ where: { id: { in: legacySeedIds.map(({ id }) => id) } } })

  for (const item of kenyanCatalogue) {
    const { slug, landlordIndex, ...listing } = item
    await prisma.listing.create({
      data: {
        ...listing,
        landlordId: landlords[landlordIndex].id,
        propertyType: listing.propertyType as PropertyType,
        buildingType: listing.buildingType as BuildingType,
        waterType: listing.waterType as WaterType,
        electricityType: listing.electricityType as ElectricityType,
        status: 'ACTIVE',
        isDemo: true,
        photos: {
          create: [1, 2, 3].map((index) => ({
            url: demoPhotoPath(slug, index),
            publicId: `demo_${slug}_${index}`,
            order: index - 1,
            isMain: index === 1,
          })),
        },
      },
    })
  }

  console.log(`Created ${kenyanCatalogue.length} listings (${affordableCount} at or below KES 25,000).`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => prisma.$disconnect())
