# Codebase Overview - Dashboard Project

This document provides a comprehensive overview of the Dashboard application to help AI assistants and developers understand the codebase without manually exploring every file.

## 🚀 Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Database**: Prisma (ORM), Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **State Management**: React Context API
- **Analytics**: PostHog, Vercel Analytics
- **Others**: Recharts (Charts), Sonner (Toasts), SWR (Data fetching)

---

## 📂 Directory Structure

### `/src/app` (Routes & Server Actions)
- `layout.tsx`: Root layout with providers (PostHog, Auth, Contexts).
- `page.tsx`: Landing/Main entry point (Redirects to dashboard or login).
- `actions.ts`: Server actions for database operations (Create/Update/Delete clients, payments).
- `/admin`: Dashboard routes.
- `/login`: Portals for user authentication.

### `/src/components` (UI Components)
- `AdminDashboardContent.tsx`: Main dashboard layout and logic.
- `ClientTable.tsx`: Detailed list of clients with filtering and actions.
- `ClientEditForm.tsx` & `CreateClientModal.tsx`: Forms for managing client data.
- `StatCard.tsx`: Reusable cards for displaying metrics (Revenue, Clients, etc.).
- `CurrencySelector.tsx` & `LanguageToggle.tsx`: Global settings controls.
- `providers.tsx`: Combines all React Context providers.

### `/src/contexts` (Global State)
- `ClientsContext.tsx`: Manages client data, filtering, and real-time updates.
- `CurrencyContext.tsx`: Handles currency switching (USD, IQD, etc.) and conversion rates.
- `LanguageContext.tsx`: Manages multi-language support (i18n).

### `/src/lib` (Utilities & Config)
- `auth.ts`: NextAuth configuration and helpers.
- `prisma.ts`: Singleton Prisma client instance.
- `constants.ts`: Shared static data and configuration.
- `translations.ts`: Translation dictionaries for supported languages.
- `format.ts`: Formatting utilities for currency, dates, and numbers.
- `types.ts`: Global TypeScript interfaces and types.

### `/prisma` (Database)
- `schema.prisma`: Defines models like `User`, `Client`, `Payment`, etc.
- `seed.ts`: Script for populating the database with initial/demo data.

---

## 🛠 Core Logic Flow

1. **Authentication**: Handled via NextAuth in `src/lib/auth.ts` and `src/app/api/auth/[...nextauth]`.
2. **Data Fetching**: Primarily server-side in `actions.ts` or client-side using `SWR` and `ClientsContext`.
3. **State Sync**: 
   - `ClientsContext` wraps the dashboard to provide client data to all child components.
   - `CurrencyContext` provides a `convert` function and current currency state globally.
   - `LanguageContext` handles UI text translation based on selected locale.
4. **Database Operations**: Server actions in `src/app/actions.ts` interact with Prisma to mutate data.

---

## 🔑 Key Features
- **Client Management**: Create, edit, and delete client profiles.
- **Payment Tracking**: Record and monitor client payments and balances.
- **Dynamic Dashboard**: Real-time stats and charts showing revenue and growth.
- **Multi-Currency Support**: Automatic conversion between USD, IQD, and other currencies.
- **Internationalization**: Support for multiple languages with instant switching.
- **Responsive Design**: Mobile-friendly layout for admin management on the go.

---

## � Data Model (Prisma)

- **Client**: Main entity representing a customer.
  - Fields: `name`, `industry`, `status` (LEAD, PENDING, ACTIVE, SUSPENDED), `priceQuoted`, `amountPaid`.
  - Relations: Has many `Note` items and `Payment` items.
- **Payment**: Tracks individual financial transactions for a client.
  - Fields: `amount`, `date`.
  - Relation: Belongs to one `Client`.
- **Note**: Stores updates or details about a client.
  - Fields: `content`, `createdAt`.
  - Relation: Belongs to one `Client`.

---

## �📜 Available Scripts
- `npm run dev`: Start development server.
- `npm run build`: Generate Prisma client and build Next.js app.
- `npm run start`: Run production build.
- `npx prisma studio`: Open database GUI.
- `npx prisma db push`: Sync schema with database.
