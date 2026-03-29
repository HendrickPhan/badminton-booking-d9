# 🏸 Book Cầu Lông Q9 - Badminton Management System

A comprehensive badminton court booking and management system built with Next.js 16, Supabase, and shadcn/ui.

## 📋 Description

This application helps manage badminton court bookings, player registrations, match records, and payment tracking. It features an ELO-based ranking system for singles and doubles matches, making it perfect for organizing competitive badminton sessions.

### Key Features

- **🔐 Authentication**: JWT-based authentication with admin and user roles
- **📅 Booking Management**: Create, manage, and track court bookings
- **👥 Participant Voting**: Players can join or decline booking invitations
- **💰 Payment Tracking**: Automatic cost calculation and payment status management
- **🏆 Match Recording**: Record 1v1 and 2v2 match results
- **📊 ELO Rankings**: Dynamic ranking system for singles and doubles
- **📍 Court Management**: Manage badminton centers with Google Maps integration
- **📱 Responsive Design**: Mobile-first design that works on all devices
- **🔗 Social Sharing**: Share bookings via social media or messaging apps

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | shadcn/ui |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Custom JWT (jose library) |
| **Icons** | Lucide React |
| **State Management** | React Hooks |
| **Testing** | Vitest, React Testing Library |
| **Linting** | ESLint 9 |

## 📁 Project Structure

```
badminton_management/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Authentication routes
│   │   │   └── login/            # Login page
│   │   ├── (dashboard)/          # Protected dashboard routes
│   │   │   ├── admin/            # Admin-only pages
│   │   │   │   ├── centers/      # Court management
│   │   │   │   ├── settings/     # System settings
│   │   │   │   └── users/        # User management
│   │   │   ├── bookings/         # Booking management
│   │   │   │   └── [id]/         # Booking detail page
│   │   │   ├── matches/          # Match records
│   │   │   │   └── rankings/     # Player rankings
│   │   │   ├── payments/         # Payment overview
│   │   │   └── profile/          # User profile
│   │   └── api/                  # API routes
│   │       ├── auth/             # Authentication endpoints
│   │       ├── admin/            # Admin endpoints
│   │       ├── bookings/         # Booking CRUD
│   │       ├── matches/          # Match recording
│   │       ├── rankings/         # Rankings data
│   │       └── payments/         # Payment management
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── layout/               # Layout components
│   │   └── confirm-dialog.tsx    # Reusable confirm dialog
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility functions
│   │   ├── auth-session.ts       # JWT authentication
│   │   ├── db.ts                 # Database client
│   │   └── utils.ts              # Utility functions
│   ├── types/                    # TypeScript types
│   │   └── database.ts           # Database schema types
│   └── test/                     # Test setup
│       └── setup.ts              # Vitest setup
├── supabase/                     # Database schemas
│   ├── schema.sql                # Complete database schema
│   └── migrations/               # Migration scripts
├── scripts/                      # Utility scripts
│   ├── seed-admin.ts             # Create admin user
│   └── migrate.ts                # Database migration
├── public/                       # Static assets
├── vitest.config.ts              # Vitest configuration
├── eslint.config.mjs             # ESLint configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd badminton_management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Set up the database**

   Run the SQL schema in your Supabase SQL Editor:
   ```bash
   # Copy and run the contents of supabase/schema.sql in Supabase Dashboard
   ```

5. **Create admin user** (optional)
   ```bash
   npm run seed
   ```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run seed` | Seed admin user |
| `npm run db:migrate` | Run database migrations |

## 🧪 Testing

The project uses **Vitest** with **React Testing Library** for unit testing.

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Writing Tests

Place test files next to the source files with `.test.ts` or `.spec.ts` extension:

```typescript
// Example: src/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })
})
```

## 🔍 Code Quality

### Linting

The project uses ESLint 9 with Next.js recommended rules:

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

### TypeScript

TypeScript strict mode is enabled. Always ensure proper typing:

```bash
# Type check is included in build
npm run build
```

## 🗄️ Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts with custom JWT auth |
| `centers` | Badminton court locations |
| `bookings` | Court booking sessions |
| `booking_participants` | Player participation in bookings |
| `booking_consumables` | Consumables (shuttlecocks, drinks) |
| `payments` | Payment tracking per user |
| `matches` | Match results (1v1 and 2v2) |
| `rankings` | ELO ratings for players |
| `settings` | System configuration |

### Migrations

Database migrations are located in `supabase/migrations/`:

```bash
# Apply email to phone_number migration
# Run supabase/migrations/001_email_to_phone.sql in Supabase SQL Editor
```

## 🔐 Authentication

The system uses custom JWT authentication:

- **Token Storage**: HTTP-only cookies
- **Token Expiry**: 7 days
- **Roles**: `user` and `admin`

Default admin credentials are set in `supabase/schema.sql`.

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
JWT_SECRET=your_secure_jwt_secret
```

## 📱 Features Overview

### For Admins
- Create and manage bookings
- Manage users and their roles
- Manage badminton centers
- Update booking statuses
- Add consumables to bookings
- Mark payments as paid
- Configure female discount settings

### For Users
- View upcoming bookings
- Join or decline booking invitations
- View personal payment status
- Record match results
- View player rankings
- Update profile information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

---

Built with ❤️ for badminton enthusiasts
