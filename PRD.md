# DebtTrack – Product Requirements Document

## Overview
DebtTrack is a web-based debt tracking dashboard built with Next.js. It allows business owners to track client debts from any device (phone or PC) without needing Excel or a notebook. The app replaces manual bookkeeping with a fast, real-time digital solution.

---

## Core Users
- **Admin (authenticated)**: Full access to create, edit, delete clients and payments, powered by Supabase.
- **Demo (unauthenticated)**: Local-only access using sample data stored in localStorage.

---

## Key Features

### 1. Dashboard – Main Screen (`/`)
- The app loads on a dark premium UI (dark slate background `#0d0f1a`, gold `#D4AF37` accents).
- A **sticky glassmorphism header** shows the app name "DebtTrack", a badge for Admin/Demo mode, and controls (Language toggle, Currency selector, Sign In/Out).
- **4 stat cards** display key metrics: Total Clients, Total Collected, Outstanding Debt, Active Projects.
  - Stat cards scroll horizontally on mobile and form a 4-column grid on desktop.
- Below the stats is the **Client List** panel with search, filter, and sort controls.
- On mobile, a **bottom navigation bar** is always visible with: Home, Clients, Add Client (+), Stats, Sign In/Out.

### 2. Quick Debt Operations (Core Feature)
Every client row/card has two instant action buttons:
- **"Add Money" (green)**: Records a payment from the client → reduces outstanding debt → calls `addPaymentFn`.
- **"Add Debt" (red)**: Adds a new debt amount to the client's total → calls `updateClientFn` to increase `priceQuoted`.
- Clicking either button shows an **inline input form** (no page navigation required).
- Input auto-focuses, user enters amount, presses Enter or clicks ✓ to confirm.
- A **progress bar** shows how much of the total debt has been paid (paid/total ratio).
- The debt amount is shown in red if outstanding, in green badge "PAID" if fully paid.

### 3. Client List
- **Search**: Filter clients by name or phone number in real time.
- **Status Filters**: Pills to filter by ALL, LEAD, ACTIVE, PENDING, SUSPENDED.
- **Smart Filters dropdown**: DEBT (has balance), PAID (fully paid), HIGH_VALUE, ACTIVE (recent), DORMANT.
- **Sort**: Default sorts by highest debt first.
- **Mobile**: Expandable cards — tap to expand and reveal Quick Actions + full details.
- **Desktop**: Table with columns: Name, Status, Debt Overview (progress bar + amounts), Quick Actions, Last Activity, Delete.

### 4. Add New Client
- A modal accessible from the header button (desktop) and the FAB "+" button in the bottom nav (mobile).
- Fields: Name, Phone, Industry, Price Quoted (total debt), Amount Paid (initial payment), Status, Logo URL.

### 5. Client Detail Page (`/admin/client?id=...`)
- Full edit form for all client fields.
- Payment history log.
- Interaction/notes log.
- Invoice generation.

### 6. Authentication
- Login page at `/login` using NextAuth.js.
- Admin users see real Supabase data.
- Unauthenticated users see demo mode with localStorage data.

### 7. Currency Support
- Switch between USD (`$`) and IQD (Iraqi Dinar).
- All amounts display in selected currency.
- Payment entries are stored in USD and converted for display.

### 8. Language Support
- Toggle between English (LTR) and Arabic (RTL).
- All UI labels, buttons, and messages use the translation system.

---

## Acceptance Criteria

| Feature | Expected Behavior |
|---------|-------------------|
| Page loads | Dashboard renders without errors at `https://dashboard.nexadigital.dev` |
| Stat cards | All 4 stat cards visible with correct labels |
| Search | Typing in search box filters client list instantly |
| Add Money | Click "Add Money" → input appears → enter amount → confirm → debt decreases |
| Add Debt | Click "Add Debt" → input appears → enter amount → confirm → outstanding increases |
| Progress bar | Shows green when paid, red/yellow when partially paid |
| Mobile cards | At 375px width: cards are full-width, expandable, bottom nav is visible |
| Filter pills | Clicking ACTIVE/PENDING/etc. filters the client list |
| Add Client | Clicking "+ Add" opens modal with form fields |
| Sign In button | Visible when not authenticated, links to `/login` |
| Currency toggle | Switching currency updates all displayed amounts |
| Language toggle | Switching language updates all text labels |
| Delete client | Trash icon deletes client after confirmation |
| Demo mode | Unauthenticated users see sample clients and can add/edit locally |
