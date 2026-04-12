# VerifiedNyumba

Kenya's trusted platform for finding verified rental properties directly from landlords.

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Prisma ORM
- Neon PostgreSQL
- JWT auth
- Cloudinary
- Leaflet + OpenStreetMap
- Socket.IO

## Environment

Copy `.env.example` to `.env.local` and fill in the values:

```env
DATABASE_URL="postgresql://username:password@ep-xxx-pooler.us-east-1.aws.neon.tech/verifiednyumba?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/verifiednyumba?sslmode=require"
MIGRATION_MONGODB_URL="mongodb+srv://username:password@cluster.mongodb.net/verifiednyumba?retryWrites=true&w=majority"
RESET_POSTGRES="false"
JWT_SECRET="your-jwt-secret-key-min-32-characters-long"
JWT_REFRESH_SECRET="your-refresh-token-secret-key-min-32-characters"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

`DATABASE_URL` should be the Neon pooled connection string used by the app. `DIRECT_URL` should be the direct Neon connection string used by Prisma migrations. `MIGRATION_MONGODB_URL` is only for the one-off import script and is not used by the runtime app.

## Local Setup

```bash
npm install
npm run db:generate
npm run dev
```

Useful database commands:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:import:mongo
```

## Neon Setup

1. Create a Neon project in the region closest to your users.
2. Copy the pooled connection into `DATABASE_URL`.
3. Copy the direct connection into `DIRECT_URL`.
4. Ensure both URLs include `sslmode=require`.
5. Run Prisma migrations against Neon.

## MongoDB to PostgreSQL Migration

The app now uses a single Prisma client path backed by PostgreSQL. There is no MongoDB fallback mode in runtime.

### What changed

- Prisma datasource switched from MongoDB to PostgreSQL.
- All model IDs are now UUID strings.
- A one-off importer remaps Mongo ObjectIds to PostgreSQL UUIDs while preserving relations.
- Seed data and docs were updated for relational constraints.

### Import script

Run the importer after the PostgreSQL schema exists:

```bash
npm run db:import:mongo
```

The importer:

- Reads the source MongoDB database from `MIGRATION_MONGODB_URL`
- Generates new UUIDs for every migrated row
- Rewrites all foreign keys using an in-memory ID map
- Bulk inserts data into PostgreSQL in dependency order
- Writes an audit file to `scripts/backup/mongo-to-postgres-id-map.json`

If you want the target PostgreSQL database emptied before import, set:

```env
RESET_POSTGRES="true"
```

### Cutover runbook

1. Freeze writes to the Mongo-backed app.
2. Point `.env.local` or deployment env vars to Neon `DATABASE_URL` and `DIRECT_URL`.
3. Run the Prisma migration on Neon.
4. Run `npm run db:import:mongo`.
5. Verify row counts and core flows: login, register, create listing, save listing, chat, bookings, verification, reviews, and reports.
6. Reopen traffic.

## Project Structure

```text
app/
  (auth)/
  (dashboard)/
  (main)/
  api/
  components/
  lib/
prisma/
scripts/
```

## API Surface

The MongoDB to PostgreSQL migration does not change the app's HTTP routes, payloads, or response shapes. IDs remain opaque strings at the API boundary.
