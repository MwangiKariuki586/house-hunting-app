import 'dotenv/config'

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

import {
  BookingStatus,
  BuildingType,
  ElectricityType,
  ListingStatus,
  ProfileTier,
  Prisma,
  PrismaClient,
  PropertyType,
  ReportReason,
  ReportStatus,
  UserRole,
  VerificationStatus,
  WaterType,
} from '@prisma/client'
import { MongoClient, ObjectId } from 'mongodb'

type IdMap = Record<string, Record<string, string>>

const prisma = new PrismaClient()

const SOURCE_MONGODB_URL = process.env.MIGRATION_MONGODB_URL
const RESET_TARGET = process.env.RESET_POSTGRES === 'true'

function assertEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function toIdString(value: unknown): string {
  if (!value) {
    throw new Error('Expected ID value but received empty value')
  }

  if (typeof value === 'string') {
    return value
  }

  if (value instanceof ObjectId) {
    return value.toHexString()
  }

  if (typeof value === 'object' && value !== null && 'toHexString' in value) {
    return (value as { toHexString(): string }).toHexString()
  }

  return String(value)
}

function toOptionalIdString(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  return toIdString(value)
}

function toDate(value: unknown): Date | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(value)
  }

  if (typeof value === 'object' && value !== null && '$date' in value) {
    return new Date((value as { $date: string | number }).$date)
  }

  return undefined
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string')
}

function toEnumValue<T extends string>(
  value: unknown,
  enumObject: Record<string, T>,
  fallback: T
): T {
  return Object.values(enumObject).includes(value as T) ? (value as T) : fallback
}

function getMappedId(idMap: IdMap, model: keyof IdMap, oldId: unknown): string {
  const key = toIdString(oldId)
  const mapped = idMap[model][key]

  if (!mapped) {
    throw new Error(`Missing ${String(model)} ID mapping for source ID ${key}`)
  }

  return mapped
}

async function resetTargetDatabase() {
  console.log('Resetting PostgreSQL target tables...')

  await prisma.$transaction([
    prisma.viewingBooking.deleteMany(),
    prisma.message.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.savedListing.deleteMany(),
    prisma.review.deleteMany(),
    prisma.report.deleteMany(),
    prisma.viewingSlot.deleteMany(),
    prisma.listingPhoto.deleteMany(),
    prisma.landlordVerification.deleteMany(),
    prisma.verificationDoc.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.newsletter.deleteMany(),
    prisma.listing.deleteMany(),
    prisma.user.deleteMany(),
  ])
}

async function main() {
  assertEnv('DATABASE_URL', process.env.DATABASE_URL)
  assertEnv('DIRECT_URL', process.env.DIRECT_URL)
  const mongoUrl = assertEnv('MIGRATION_MONGODB_URL', SOURCE_MONGODB_URL)

  const mongo = new MongoClient(mongoUrl)

  try {
    console.log('Connecting to MongoDB source...')
    await mongo.connect()
    const db = mongo.db()

    if (RESET_TARGET) {
      await resetTargetDatabase()
    }

    console.log('Loading MongoDB collections...')
    const [
      users,
      verificationDocs,
      refreshTokens,
      passwordResetTokens,
      listings,
      listingPhotos,
      savedListings,
      conversations,
      messages,
      viewingSlots,
      viewingBookings,
      reviews,
      reports,
      newsletters,
    ] = await Promise.all([
      db.collection('users').find({}).toArray(),
      db.collection('verification_docs').find({}).toArray(),
      db.collection('refresh_tokens').find({}).toArray(),
      db.collection('password_reset_tokens').find({}).toArray(),
      db.collection('listings').find({}).toArray(),
      db.collection('listing_photos').find({}).toArray(),
      db.collection('saved_listings').find({}).toArray(),
      db.collection('conversations').find({}).toArray(),
      db.collection('messages').find({}).toArray(),
      db.collection('viewing_slots').find({}).toArray(),
      db.collection('viewing_bookings').find({}).toArray(),
      db.collection('reviews').find({}).toArray(),
      db.collection('reports').find({}).toArray(),
      db.collection('newsletters').find({}).toArray(),
    ])

    const idMap: IdMap = {
      users: {},
      verification_docs: {},
      refresh_tokens: {},
      landlord_verifications: {},
      password_reset_tokens: {},
      listings: {},
      listing_photos: {},
      saved_listings: {},
      conversations: {},
      messages: {},
      viewing_slots: {},
      viewing_bookings: {},
      reviews: {},
      reports: {},
      newsletters: {},
    }

    const usersData: Prisma.UserCreateManyInput[] = users.map((doc) => {
      const id = randomUUID()
      idMap.users[toIdString(doc._id)] = id

      return {
        id,
        email: String(doc.email),
        phone: String(doc.phone),
        password: String(doc.password),
        firstName: String(doc.firstName),
        lastName: String(doc.lastName),
        avatar: typeof doc.avatar === 'string' ? doc.avatar : null,
        role: toEnumValue(doc.role, UserRole, UserRole.TENANT),
        emailVerified: Boolean(doc.emailVerified),
        phoneVerified: Boolean(doc.phoneVerified),
        createdAt: toDate(doc.createdAt) ?? new Date(),
        updatedAt: toDate(doc.updatedAt) ?? new Date(),
        lastLoginAt: toDate(doc.lastLoginAt) ?? null,
        showOnlyDirectListings: Boolean(doc.showOnlyDirectListings),
      }
    })

    const landlordVerificationsByUserId = new Map(
      (
        await db.collection('landlord_verifications').find({}).toArray()
      ).map((doc) => [toIdString(doc.userId), doc])
    )

    const landlordVerificationsData: Prisma.LandlordVerificationCreateManyInput[] = users
      .filter((doc) => doc.role === UserRole.LANDLORD)
      .map((doc) => {
        const sourceUserId = toIdString(doc._id)
        const sourceVerification = landlordVerificationsByUserId.get(sourceUserId)
        const id = randomUUID()
        idMap.landlord_verifications[sourceUserId] = id

        return {
          id,
          userId: getMappedId(idMap, 'users', sourceUserId),
          status: toEnumValue(
            sourceVerification?.status ?? doc.verificationStatus,
            VerificationStatus,
            VerificationStatus.PENDING
          ),
          note:
            typeof sourceVerification?.note === 'string'
              ? sourceVerification.note
              : typeof doc.verificationNote === 'string'
                ? doc.verificationNote
                : null,
          verifiedAt:
            toDate(sourceVerification?.verifiedAt) ??
            toDate(doc.verifiedAt) ??
            null,
          tier: toEnumValue(sourceVerification?.tier, ProfileTier, ProfileTier.BASIC),
          completeness:
            typeof sourceVerification?.completeness === 'number'
              ? sourceVerification.completeness
              : 0,
          idVerified: Boolean(sourceVerification?.idVerified),
          idVerifiedAt: toDate(sourceVerification?.idVerifiedAt) ?? null,
          propertyVerified: Boolean(sourceVerification?.propertyVerified),
          propertyVerifiedAt: toDate(sourceVerification?.propertyVerifiedAt) ?? null,
          createdAt: toDate(sourceVerification?.createdAt) ?? new Date(),
          updatedAt: toDate(sourceVerification?.updatedAt) ?? new Date(),
        }
      })

    const verificationDocsData: Prisma.VerificationDocCreateManyInput[] = verificationDocs.map((doc) => {
      const id = randomUUID()
      idMap.verification_docs[toIdString(doc._id)] = id

      return {
        id,
        userId: getMappedId(idMap, 'users', doc.userId),
        type: String(doc.type),
        url: String(doc.url),
        publicId: String(doc.publicId),
        uploadedAt: toDate(doc.uploadedAt) ?? new Date(),
      }
    })

    const refreshTokensData: Prisma.RefreshTokenCreateManyInput[] = refreshTokens.map((doc) => {
      const id = randomUUID()
      idMap.refresh_tokens[toIdString(doc._id)] = id

      return {
        id,
        token: String(doc.token),
        userId: getMappedId(idMap, 'users', doc.userId),
        expiresAt: toDate(doc.expiresAt) ?? new Date(),
        createdAt: toDate(doc.createdAt) ?? new Date(),
      }
    })

    const passwordResetTokensData: Prisma.PasswordResetTokenCreateManyInput[] = passwordResetTokens.map((doc) => {
      const id = randomUUID()
      idMap.password_reset_tokens[toIdString(doc._id)] = id

      return {
        id,
        token: String(doc.token),
        userId: getMappedId(idMap, 'users', doc.userId),
        expiresAt: toDate(doc.expiresAt) ?? new Date(),
        usedAt: toDate(doc.usedAt) ?? null,
        createdAt: toDate(doc.createdAt) ?? new Date(),
      }
    })

    const listingsData: Prisma.ListingCreateManyInput[] = listings.map((doc) => {
      const id = randomUUID()
      idMap.listings[toIdString(doc._id)] = id

      return {
        id,
        landlordId: getMappedId(idMap, 'users', doc.landlordId),
        title: String(doc.title),
        description: String(doc.description),
        status: toEnumValue(doc.status, ListingStatus, ListingStatus.ACTIVE),
        area: String(doc.area),
        estate: typeof doc.estate === 'string' ? doc.estate : null,
        landmark: typeof doc.landmark === 'string' ? doc.landmark : null,
        address: typeof doc.address === 'string' ? doc.address : null,
        latitude: typeof doc.latitude === 'number' ? doc.latitude : null,
        longitude: typeof doc.longitude === 'number' ? doc.longitude : null,
        distanceToCBD: typeof doc.distanceToCBD === 'number' ? doc.distanceToCBD : null,
        distanceToStage: typeof doc.distanceToStage === 'number' ? doc.distanceToStage : null,
        propertyType: toEnumValue(doc.propertyType, PropertyType, PropertyType.BEDSITTER),
        buildingType: toEnumValue(doc.buildingType, BuildingType, BuildingType.APARTMENT),
        bedrooms: typeof doc.bedrooms === 'number' ? doc.bedrooms : 1,
        bathrooms: typeof doc.bathrooms === 'number' ? doc.bathrooms : 1,
        monthlyRent: typeof doc.monthlyRent === 'number' ? doc.monthlyRent : 0,
        deposit: typeof doc.deposit === 'number' ? doc.deposit : 0,
        serviceCharge: typeof doc.serviceCharge === 'number' ? doc.serviceCharge : 0,
        waterCharge: typeof doc.waterCharge === 'number' ? doc.waterCharge : 0,
        garbageCharge: typeof doc.garbageCharge === 'number' ? doc.garbageCharge : 0,
        waterType: toEnumValue(doc.waterType, WaterType, WaterType.COUNCIL),
        electricityType: toEnumValue(doc.electricityType, ElectricityType, ElectricityType.TOKEN),
        parking: Boolean(doc.parking),
        parkingSpaces: typeof doc.parkingSpaces === 'number' ? doc.parkingSpaces : 0,
        petsAllowed: Boolean(doc.petsAllowed),
        familyFriendly: doc.familyFriendly === undefined ? true : Boolean(doc.familyFriendly),
        bachelorFriendly: doc.bachelorFriendly === undefined ? true : Boolean(doc.bachelorFriendly),
        gatedCommunity: Boolean(doc.gatedCommunity),
        furnished: Boolean(doc.furnished),
        amenities: toStringArray(doc.amenities),
        videoUrl: typeof doc.videoUrl === 'string' ? doc.videoUrl : null,
        photosVerifiedAt: toDate(doc.photosVerifiedAt) ?? null,
        dailyRentAvailable: Boolean(doc.dailyRentAvailable),
        weeklyRentAvailable: Boolean(doc.weeklyRentAvailable),
        dailyRent: typeof doc.dailyRent === 'number' ? doc.dailyRent : null,
        weeklyRent: typeof doc.weeklyRent === 'number' ? doc.weeklyRent : null,
        viewCount: typeof doc.viewCount === 'number' ? doc.viewCount : 0,
        createdAt: toDate(doc.createdAt) ?? new Date(),
        updatedAt: toDate(doc.updatedAt) ?? new Date(),
      }
    })

    const listingPhotosData: Prisma.ListingPhotoCreateManyInput[] = listingPhotos.map((doc) => {
      const id = randomUUID()
      idMap.listing_photos[toIdString(doc._id)] = id

      return {
        id,
        listingId: getMappedId(idMap, 'listings', doc.listingId),
        url: String(doc.url),
        publicId: String(doc.publicId),
        order: typeof doc.order === 'number' ? doc.order : 0,
        isMain: Boolean(doc.isMain),
        uploadedAt: toDate(doc.uploadedAt) ?? new Date(),
      }
    })

    const savedListingsData: Prisma.SavedListingCreateManyInput[] = savedListings.map((doc) => {
      const id = randomUUID()
      idMap.saved_listings[toIdString(doc._id)] = id

      return {
        id,
        userId: getMappedId(idMap, 'users', doc.userId),
        listingId: getMappedId(idMap, 'listings', doc.listingId),
        savedAt: toDate(doc.savedAt) ?? new Date(),
      }
    })

    const conversationsData: Prisma.ConversationCreateManyInput[] = conversations.map((doc) => {
      const id = randomUUID()
      idMap.conversations[toIdString(doc._id)] = id

      return {
        id,
        tenantId: getMappedId(idMap, 'users', doc.tenantId),
        landlordId: getMappedId(idMap, 'users', doc.landlordId),
        listingId: getMappedId(idMap, 'listings', doc.listingId),
        tenantRevealed: Boolean(doc.tenantRevealed),
        landlordRevealed: Boolean(doc.landlordRevealed),
        createdAt: toDate(doc.createdAt) ?? new Date(),
        updatedAt: toDate(doc.updatedAt) ?? new Date(),
      }
    })

    const messagesData: Prisma.MessageCreateManyInput[] = messages.map((doc) => {
      const id = randomUUID()
      idMap.messages[toIdString(doc._id)] = id

      return {
        id,
        conversationId: getMappedId(idMap, 'conversations', doc.conversationId),
        senderId: getMappedId(idMap, 'users', doc.senderId),
        content: String(doc.content ?? ''),
        isPreFilled: Boolean(doc.isPreFilled),
        readAt: toDate(doc.readAt) ?? null,
        createdAt: toDate(doc.createdAt) ?? new Date(),
      }
    })

    const viewingSlotsData: Prisma.ViewingSlotCreateManyInput[] = viewingSlots.map((doc) => {
      const id = randomUUID()
      idMap.viewing_slots[toIdString(doc._id)] = id

      return {
        id,
        listingId: getMappedId(idMap, 'listings', doc.listingId),
        dayOfWeek: typeof doc.dayOfWeek === 'number' ? doc.dayOfWeek : 0,
        startTime: String(doc.startTime),
        endTime: String(doc.endTime),
        isActive: doc.isActive === undefined ? true : Boolean(doc.isActive),
      }
    })

    const viewingBookingsData: Prisma.ViewingBookingCreateManyInput[] = viewingBookings.map((doc) => {
      const id = randomUUID()
      idMap.viewing_bookings[toIdString(doc._id)] = id

      return {
        id,
        slotId: getMappedId(idMap, 'viewing_slots', doc.slotId),
        tenantId: getMappedId(idMap, 'users', doc.tenantId),
        date: toDate(doc.date) ?? new Date(),
        status: toEnumValue(doc.status, BookingStatus, BookingStatus.PENDING),
        reminderSent: Boolean(doc.reminderSent),
        notes: typeof doc.notes === 'string' ? doc.notes : null,
        createdAt: toDate(doc.createdAt) ?? new Date(),
        updatedAt: toDate(doc.updatedAt) ?? new Date(),
      }
    })

    const reviewsData: Prisma.ReviewCreateManyInput[] = reviews.map((doc) => {
      const id = randomUUID()
      idMap.reviews[toIdString(doc._id)] = id

      const sourceListingId = toOptionalIdString(doc.listingId)

      return {
        id,
        reviewerId: getMappedId(idMap, 'users', doc.reviewerId),
        targetUserId: getMappedId(idMap, 'users', doc.targetUserId),
        listingId: sourceListingId ? getMappedId(idMap, 'listings', sourceListingId) : null,
        accuracyRating: typeof doc.accuracyRating === 'number' ? doc.accuracyRating : 0,
        responsivenessRating: typeof doc.responsivenessRating === 'number' ? doc.responsivenessRating : 0,
        overallRating: typeof doc.overallRating === 'number' ? doc.overallRating : 0,
        comment: typeof doc.comment === 'string' ? doc.comment : null,
        createdAt: toDate(doc.createdAt) ?? new Date(),
      }
    })

    const reportsData: Prisma.ReportCreateManyInput[] = reports.map((doc) => {
      const id = randomUUID()
      idMap.reports[toIdString(doc._id)] = id
      const resolvedBy = toOptionalIdString(doc.resolvedBy)

      return {
        id,
        reporterId: getMappedId(idMap, 'users', doc.reporterId),
        listingId: getMappedId(idMap, 'listings', doc.listingId),
        reason: toEnumValue(doc.reason, ReportReason, ReportReason.OTHER),
        description: typeof doc.description === 'string' ? doc.description : null,
        evidence: toStringArray(doc.evidence),
        status: toEnumValue(doc.status, ReportStatus, ReportStatus.PENDING),
        resolvedAt: toDate(doc.resolvedAt) ?? null,
        resolvedBy: resolvedBy ? getMappedId(idMap, 'users', resolvedBy) : null,
        resolution: typeof doc.resolution === 'string' ? doc.resolution : null,
        createdAt: toDate(doc.createdAt) ?? new Date(),
      }
    })

    const newslettersData: Prisma.NewsletterCreateManyInput[] = newsletters.map((doc) => {
      const id = randomUUID()
      idMap.newsletters[toIdString(doc._id)] = id

      return {
        id,
        email: String(doc.email),
        createdAt: toDate(doc.createdAt) ?? new Date(),
      }
    })

    console.log('Writing PostgreSQL data...')
    await prisma.$transaction([
      prisma.user.createMany({ data: usersData }),
      prisma.newsletter.createMany({ data: newslettersData }),
      prisma.landlordVerification.createMany({ data: landlordVerificationsData }),
      prisma.verificationDoc.createMany({ data: verificationDocsData }),
      prisma.refreshToken.createMany({ data: refreshTokensData }),
      prisma.passwordResetToken.createMany({ data: passwordResetTokensData }),
      prisma.listing.createMany({ data: listingsData }),
      prisma.listingPhoto.createMany({ data: listingPhotosData }),
      prisma.savedListing.createMany({ data: savedListingsData }),
      prisma.conversation.createMany({ data: conversationsData }),
      prisma.message.createMany({ data: messagesData }),
      prisma.viewingSlot.createMany({ data: viewingSlotsData }),
      prisma.viewingBooking.createMany({ data: viewingBookingsData }),
      prisma.review.createMany({ data: reviewsData }),
      prisma.report.createMany({ data: reportsData }),
    ])

    const summary = {
      users: usersData.length,
      landlordVerifications: landlordVerificationsData.length,
      verificationDocs: verificationDocsData.length,
      refreshTokens: refreshTokensData.length,
      passwordResetTokens: passwordResetTokensData.length,
      listings: listingsData.length,
      listingPhotos: listingPhotosData.length,
      savedListings: savedListingsData.length,
      conversations: conversationsData.length,
      messages: messagesData.length,
      viewingSlots: viewingSlotsData.length,
      viewingBookings: viewingBookingsData.length,
      reviews: reviewsData.length,
      reports: reportsData.length,
      newsletters: newslettersData.length,
    }

    await mkdir(join(process.cwd(), 'scripts', 'backup'), { recursive: true })
    await writeFile(
      join(process.cwd(), 'scripts', 'backup', 'mongo-to-postgres-id-map.json'),
      JSON.stringify({ generatedAt: new Date().toISOString(), counts: summary, idMap }, null, 2),
      'utf8'
    )

    console.log('Migration completed successfully.')
    console.table(summary)
  } finally {
    await mongo.close()
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('Mongo to PostgreSQL migration failed.')
  console.error(error)
  process.exit(1)
})
