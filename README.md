# VerifiedNyumba - House Hunting App

Kenya's trusted platform for finding verified rental properties directly from landlords.

## Features

### For Tenants

- **Verified Landlords**: Every landlord goes through ID and property ownership verification
- **Transparent Pricing**: See monthly rent, deposit, and all charges upfront
- **Kenya-Specific Filters**: Filter by water type, electricity type, pet policy, and more
- **Location-Based Search**: Find properties near stages, CBD, schools, and hospitals
- **In-App Chat**: Contact landlords without sharing your phone number
- **Viewing Scheduling**: Book property viewings directly through the app
- **No Agent Mode**: Toggle to see only direct landlord listings

### For Landlords

- **Easy Listing**: Create listings in under 5 minutes
- **Verification Badge**: Get verified to increase trust
- **Analytics Dashboard**: Track views, inquiries, and conversions
- **Multi-Unit Management**: Manage multiple properties from one dashboard
- **Viewing Management**: Set availability and manage booking requests
- **Direct Communication**: Chat with potential tenants in-app

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT (access + refresh tokens)
- **Media Storage**: Cloudinary (with automatic watermarking)
- **Maps**: Leaflet + OpenStreetMap
- **Real-time**: Socket.IO for chat

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (local or Atlas)
- Cloudinary account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/verifiednyumba.git
cd verifiednyumba
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Database - MongoDB Atlas connection string
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/verifiednyumba"

# JWT Secrets (generate strong random strings)
JWT_SECRET="your-jwt-secret-key-min-32-characters"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key-min-32-characters"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── (auth)/                    # Authentication pages
│   ├── login/
│   └── register/
├── (main)/                    # Public pages
│   ├── page.tsx               # Homepage
│   ├── properties/            # Listings
│   ├── about/
│   └── services/
├── (dashboard)/               # Protected pages
│   ├── chats/                 # Messaging
│   ├── bookings/              # Viewing bookings
│   ├── saved/                 # Saved properties
│   └── landlord/              # Landlord dashboard
│       ├── listings/
│       ├── create/
│       ├── analytics/
│       └── verification/
├── api/                       # API routes
│   ├── auth/
│   ├── listings/
│   ├── chat/
│   ├── bookings/
│   ├── reviews/
│   └── reports/
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── layout/                # Header, Footer
│   ├── cards/                 # Property cards
│   ├── forms/                 # Form components
│   └── maps/                  # Map components
└── lib/                       # Utilities
    ├── prisma.ts
    ├── auth.ts
    ├── cloudinary.ts
    └── validations/
```

## Kenya-Specific Features

- **Areas**: Predefined list of Kenyan areas (Westlands, Kilimani, Kasarani, etc.)
- **Water Type**: Borehole, Council, Both, None
- **Electricity**: Token (Prepaid), Postpaid
- **Building Types**: Apartment, Standalone, Mabati, Servant Quarters
- **Property Types**: Bedsitter, Studio, 1BR, 2BR, 3BR, 4+BR
- **Phone Format**: Kenyan phone number validation (07XX, 01XX)
- **Currency**: KES (Kenya Shillings)

## API Routes

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Listings

- `GET /api/listings` - Get listings with filters
- `POST /api/listings` - Create listing (landlord only)
- `GET /api/listings/[id]` - Get single listing
- `PATCH /api/listings/[id]` - Update listing
- `DELETE /api/listings/[id]` - Delete listing
- `POST /api/listings/[id]/save` - Save listing
- `DELETE /api/listings/[id]/save` - Unsave listing

### Chat

- `GET /api/chat` - Get conversations
- `GET /api/chat/[id]` - Get conversation with messages
- `POST /api/chat/[id]/messages` - Send message
- `POST /api/chat/[id]/reveal` - Reveal phone number
- `POST /api/chat/start` - Start new conversation

### Reviews & Reports

- `GET /api/reviews?userId=X` - Get user reviews
- `POST /api/reviews` - Create review
- `POST /api/reports` - Report listing

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support, email support@verifiednyumba.co.ke or open an issue on GitHub.
