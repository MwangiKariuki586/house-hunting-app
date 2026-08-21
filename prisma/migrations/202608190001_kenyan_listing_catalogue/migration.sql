ALTER TYPE "PropertyType" ADD VALUE IF NOT EXISTS 'SINGLE_ROOM' BEFORE 'BEDSITTER';

ALTER TABLE "listings"
  ADD COLUMN IF NOT EXISTS "county" TEXT NOT NULL DEFAULT 'Nairobi',
  ADD COLUMN IF NOT EXISTS "floorAreaSqM" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "listings_county_idx" ON "listings"("county");
CREATE INDEX IF NOT EXISTS "listings_county_area_idx" ON "listings"("county", "area");

-- The original catalogue used seed_* photo identifiers and @example.com landlords.
-- Mark only records that satisfy both conditions so future seeds can replace them safely.
UPDATE "listings" AS listing
SET "isDemo" = true
FROM "users" AS landlord
WHERE listing."landlordId" = landlord."id"
  AND landlord."email" LIKE '%@example.com'
  AND EXISTS (
    SELECT 1
    FROM "listing_photos" AS photo
    WHERE photo."listingId" = listing."id"
      AND photo."publicId" LIKE 'seed_%'
  );
