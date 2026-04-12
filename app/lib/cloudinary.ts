// Cloudinary configuration and utilities for VerifiedNyumba
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

// Upload options for different types
export const uploadOptions = {
  // Listing photos with watermark
  listingPhoto: {
    folder: 'verifiednyumba/listings',
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto:good' },
    ],
  },

  // Verification documents (no public access)
  verificationDoc: {
    folder: 'verifiednyumba/verification',
    type: 'private',
    transformation: [
      { width: 2000, height: 2000, crop: 'limit' },
      { quality: 'auto:good' },
    ],
  },

  // User avatars
  avatar: {
    folder: 'verifiednyumba/avatars',
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' },
      { radius: 'max' },
    ],
  },

  // Report evidence
  reportEvidence: {
    folder: 'verifiednyumba/reports',
    type: 'private',
  },
}

// Upload image from base64
export async function uploadImage(
  base64Data: string,
  options: keyof typeof uploadOptions
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(base64Data, {
    ...uploadOptions[options],
    resource_type: 'image',
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
  }
}

// Upload video
export async function uploadVideo(
  base64Data: string
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(base64Data, {
    folder: 'verifiednyumba/videos',
    resource_type: 'video',
    transformation: [
      { width: 1280, height: 720, crop: 'limit' },
      { quality: 'auto:good' },
    ],
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
  }
}

// Delete resource by public ID
export async function deleteResource(
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  })
}

// Generate thumbnail URL
export function getThumbnailUrl(url: string, width = 400, height = 300): string {
  if (!url.includes('cloudinary.com')) return url

  // Insert transformation into Cloudinary URL
  const parts = url.split('/upload/')
  if (parts.length !== 2) return url

  return `${parts[0]}/upload/w_${width},h_${height},c_fill/${parts[1]}`
}

// Generate signed URL for private resources
export async function getSignedUrl(publicId: string): Promise<string> {
  return cloudinary.url(publicId, {
    type: 'private',
    sign_url: true,
    secure: true,
  })
}



