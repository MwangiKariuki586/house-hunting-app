// Validation schemas for listings
import { z } from 'zod'

export const createListingSchema = z.object({
  // Basic info
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title is too long'),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description is too long'),
  
  // Location
  area: z.string().min(1, 'Area is required'),
  estate: z.string().optional(),
  landmark: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  distanceToCBD: z.number().min(0).optional(),
  distanceToStage: z.number().min(0).optional(),
  
  // Property details
  propertyType: z.enum([
    'BEDSITTER',
    'STUDIO',
    'ONE_BEDROOM',
    'TWO_BEDROOM',
    'THREE_BEDROOM',
    'FOUR_PLUS_BEDROOM',
  ]),
  buildingType: z.enum([
    'APARTMENT',
    'STANDALONE',
    'MABATI',
    'SERVANT_QUARTERS',
    'BUNGALOW',
    'MAISONETTE',
    'TOWNHOUSE',
  ]),
  bedrooms: z.number().min(0).max(10).default(1),
  bathrooms: z.number().min(1).max(10).default(1),
  
  // Pricing - All required for transparency
  monthlyRent: z
    .number()
    .min(1000, 'Monthly rent must be at least KES 1,000')
    .max(1000000, 'Monthly rent seems too high'),
  deposit: z
    .number()
    .min(0, 'Deposit cannot be negative')
    .max(1000000, 'Deposit seems too high'),
  serviceCharge: z.number().min(0).default(0),
  waterCharge: z.number().min(0).default(0),
  garbageCharge: z.number().min(0).default(0),
  
  // Kenya-specific features
  waterType: z.enum(['BOREHOLE', 'COUNCIL', 'BOTH', 'NONE']).default('COUNCIL'),
  electricityType: z.enum(['TOKEN', 'POSTPAID', 'NONE']).default('TOKEN'),
  parking: z.boolean().default(false),
  parkingSpaces: z.number().min(0).max(10).default(0),
  petsAllowed: z.boolean().default(false),
  familyFriendly: z.boolean().default(true),
  bachelorFriendly: z.boolean().default(true),
  gatedCommunity: z.boolean().default(false),
  furnished: z.boolean().default(false),
  
  // Amenities
  amenities: z.array(z.string()).default([]),
  
  // Alternative rent options
  dailyRentAvailable: z.boolean().default(false),
  weeklyRentAvailable: z.boolean().default(false),
  dailyRent: z.number().min(0).optional(),
  weeklyRent: z.number().min(0).optional(),
})

export const updateListingSchema = createListingSchema.partial()

export const listingFilterSchema = z.object({
  area: z.string().optional(),
  propertyType: z.enum([
    'BEDSITTER',
    'STUDIO',
    'ONE_BEDROOM',
    'TWO_BEDROOM',
    'THREE_BEDROOM',
    'FOUR_PLUS_BEDROOM',
  ]).optional(),
  buildingType: z.enum([
    'APARTMENT',
    'STANDALONE',
    'MABATI',
    'SERVANT_QUARTERS',
    'BUNGALOW',
    'MAISONETTE',
    'TOWNHOUSE',
  ]).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().max(1000000).optional(),
  waterType: z.enum(['BOREHOLE', 'COUNCIL', 'BOTH', 'NONE']).optional(),
  electricityType: z.enum(['TOKEN', 'POSTPAID', 'NONE']).optional(),
  parking: z.boolean().optional(),
  petsAllowed: z.boolean().optional(),
  familyFriendly: z.boolean().optional(),
  bachelorFriendly: z.boolean().optional(),
  gatedCommunity: z.boolean().optional(),
  furnished: z.boolean().optional(),
  verifiedLandlordOnly: z.boolean().optional(),
  directLandlordOnly: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
  sortBy: z.enum(['newest', 'price_low', 'price_high', 'popular']).default('newest'),
})

export type CreateListingInput = z.infer<typeof createListingSchema>
export type UpdateListingInput = z.infer<typeof updateListingSchema>
export type ListingFilterInput = z.infer<typeof listingFilterSchema>

// Kenyan areas for autocomplete
export const kenyanAreas = [
  // Nairobi
  'Westlands', 'Kilimani', 'Lavington', 'Kileleshwa', 'Hurlingham',
  'Parklands', 'Highridge', 'Ngara', 'Pangani', 'Eastleigh',
  'Kasarani', 'Roysambu', 'Githurai', 'Kahawa', 'Zimmerman',
  'Umoja', 'Buruburu', 'Donholm', 'Embakasi', 'Pipeline',
  'South B', 'South C', 'Nairobi West', 'Langata', 'Karen',
  'Rongai', 'Syokimau', 'Mlolongo', 'Kitengela', 'Athi River',
  'Ruaka', 'Kikuyu', 'Kinoo', 'Uthiru', 'Kawangware',
  'CBD', 'Upper Hill', 'Industrial Area', 'Mombasa Road',
  
  // Mombasa
  'Nyali', 'Bamburi', 'Mtwapa', 'Shanzu', 'Kisauni',
  'Likoni', 'Changamwe', 'Miritini', 'Mikindani',
  
  // Kisumu
  'Milimani', 'Mamboleo', 'Nyalenda', 'Kondele', 'Manyatta',
  
  // Nakuru
  'Milimani Nakuru', 'Section 58', 'Pipeline Nakuru', 'Shabab',
  
  // Eldoret
  'Elgon View', 'Langas', 'Huruma', 'Pioneer',
]

// Common amenities
export const amenitiesList = [
  'WiFi Ready',
  'DSTV Ready',
  'Hot Shower',
  'Balcony',
  'Gym',
  'Swimming Pool',
  'Playground',
  'CCTV',
  'Security Guard',
  'Backup Generator',
  'Water Tank',
  'Laundry Area',
  'Rooftop Access',
  'Lift/Elevator',
  'Intercom',
  'Borehole',
  'Solar Panels',
]

