# OMIGEC Digital Platform

Plateforme digitale de l'Ordre Mauritanien des Ingénieurs en Génie Civil.

## 🚀 Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

The `.env.local` file is already configured with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yhkuerjznwducxaaoilj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Setup

Run the SQL migrations in your Supabase SQL Editor in this order:

1. **Initial Schema** (`supabase/migrations/001_initial_schema.sql`)
   - Creates tables: profiles, references_list, verifications, jobs
   - Creates enum types
   - Sets up indexes and triggers

2. **RLS Policies** (`supabase/migrations/002_rls_policies.sql`)
   - Enables Row Level Security
   - Creates access policies for all tables
   - Adds helper functions

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
omigec-platform/
├── app/
│   ├── (auth)/
│   │   ├── connexion/          # Login page
│   │   └── inscription/        # Registration page
│   ├── api/
│   │   └── search/             # Public engineer search API
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Site header with navigation
│   │   └── Footer.tsx          # Site footer
│   ├── search/
│   │   └── PublicSearchBar.tsx # Public engineer search component
│   └── ui/                     # Shadcn UI components
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── server.ts           # Server Supabase client
│   │   └── middleware.ts       # Auth middleware
│   ├── types/
│   │   └── database.ts         # TypeScript types
│   └── utils/
│       └── fee-calculator.ts   # Fee calculation utilities
└── supabase/
    └── migrations/             # Database migrations
```

## ✨ Features Implemented

### ✅ Completed

1. **Project Setup**
   - Next.js 14 with TypeScript
   - Tailwind CSS with custom primary color (#05EDDD)
   - Shadcn/UI components
   - Supabase client configuration

2. **Database Schema**
   - Complete SQL schema with enums
   - Row Level Security policies
   - TypeScript types generated

3. **Core Utilities**
   - Fee calculator (1,500 / 3,000 / 5,000 MRU based on experience)
   - Subscription status checker

4. **Public Features**
   - Landing page with hero section
   - Public engineer search by NNI
   - Search API endpoint
   - Responsive header and footer

5. **Authentication**
   - Login page
   - Registration information page
   - Auth middleware for route protection

### 🚧 To Be Implemented

- Registration wizard (multi-step form)
- Document upload functionality
- Admin dashboard
- Reference system (Parrain)
- Job board
- Engineer dashboard
- Payment integration

## 🎨 Design System

- **Primary Color**: #05EDDD (Turquoise)
- **Font**: Arial (fallback until Aljazeera font files are added)
- **Language**: French
- **Layout**: Mobile-first, responsive

## 📊 Database Schema

### Tables

- **profiles**: Engineer profiles with registration info
- **references_list**: Approved engineers who can vouch for applicants
- **verifications**: Verification requests linking applicants to references
- **jobs**: Job postings for active engineers

### Enums

- **engineer_status**: pending_docs, pending_reference, validated, suspended
- **exercise_mode**: personne_physique, personne_morale, employe_public, employe_prive
- **verification_status**: pending, confirmed, rejected

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Public can only view NNI and status of active engineers
- Users can only access their own data
- Admins have full access
- Auth middleware protects routes

## 📝 Fee Structure

Annual subscription fees based on experience:

- **< 5 years**: 1,500 MRU
- **5-15 years**: 3,000 MRU
- **> 15 years**: 5,000 MRU

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## 📖 API Routes

### GET /api/search

Search for an engineer by NNI.

**Query Parameters:**
- `nni` (required): National Identification Number

**Response:**
```json
{
  "found": true,
  "status": "active",
  "message": "Ingénieur Agréé"
}
```

## 🤝 Contributing

This is a private project for OMIGEC. Contact the administrator for contribution guidelines.

## 📄 License

Proprietary - OMIGEC © 2026
