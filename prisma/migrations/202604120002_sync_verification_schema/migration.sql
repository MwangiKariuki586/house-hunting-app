DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'ProfileTier'
  ) THEN
    CREATE TYPE "ProfileTier" AS ENUM ('BASIC', 'PHONE_VERIFIED', 'ID_VERIFIED', 'FULLY_VERIFIED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "landlord_verifications" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "note" TEXT,
  "verifiedAt" TIMESTAMP(3),
  "tier" "ProfileTier" NOT NULL DEFAULT 'BASIC',
  "completeness" INTEGER NOT NULL DEFAULT 0,
  "idVerified" BOOLEAN NOT NULL DEFAULT false,
  "idVerifiedAt" TIMESTAMP(3),
  "propertyVerified" BOOLEAN NOT NULL DEFAULT false,
  "propertyVerifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "landlord_verifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "landlord_verifications_userId_key"
  ON "landlord_verifications"("userId");

CREATE INDEX IF NOT EXISTS "landlord_verifications_status_idx"
  ON "landlord_verifications"("status");

CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_key"
  ON "password_reset_tokens"("token");

CREATE INDEX IF NOT EXISTS "password_reset_tokens_userId_idx"
  ON "password_reset_tokens"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'landlord_verifications_userId_fkey'
  ) THEN
    ALTER TABLE "landlord_verifications"
      ADD CONSTRAINT "landlord_verifications_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'password_reset_tokens_userId_fkey'
  ) THEN
    ALTER TABLE "password_reset_tokens"
      ADD CONSTRAINT "password_reset_tokens_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
DECLARE
  has_verification_status BOOLEAN;
  has_verification_note BOOLEAN;
  has_verified_at BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'verificationStatus'
  ) INTO has_verification_status;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'verificationNote'
  ) INTO has_verification_note;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'verifiedAt'
  ) INTO has_verified_at;

  IF has_verification_status THEN
    EXECUTE format(
      'INSERT INTO "landlord_verifications" ("id","userId","status","note","verifiedAt","tier","completeness","idVerified","idVerifiedAt","propertyVerified","propertyVerifiedAt","createdAt","updatedAt")
       SELECT
         md5(random()::text || clock_timestamp()::text || u."id"),
         u."id",
         u."verificationStatus",
         %s,
         %s,
         CASE
           WHEN u."verificationStatus" = ''VERIFIED'' THEN ''FULLY_VERIFIED''::"ProfileTier"
           ELSE ''BASIC''::"ProfileTier"
         END,
         0,
         CASE WHEN u."verificationStatus" = ''VERIFIED'' THEN true ELSE false END,
         %s,
         CASE WHEN u."verificationStatus" = ''VERIFIED'' THEN true ELSE false END,
         %s,
         u."createdAt",
         u."updatedAt"
       FROM "users" u
       WHERE u."role" = ''LANDLORD''
       ON CONFLICT ("userId") DO NOTHING',
      CASE WHEN has_verification_note THEN 'u."verificationNote"' ELSE 'NULL' END,
      CASE WHEN has_verified_at THEN 'u."verifiedAt"' ELSE 'NULL' END,
      CASE WHEN has_verified_at THEN 'u."verifiedAt"' ELSE 'NULL' END,
      CASE WHEN has_verified_at THEN 'u."verifiedAt"' ELSE 'NULL' END
    );
  END IF;
END $$;

ALTER TABLE "users" DROP COLUMN IF EXISTS "verificationStatus";
ALTER TABLE "users" DROP COLUMN IF EXISTS "verificationNote";
ALTER TABLE "users" DROP COLUMN IF EXISTS "verifiedAt";
