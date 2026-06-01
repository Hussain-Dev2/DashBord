# Graph Report - Dashbord  (2026-06-01)

## Corpus Check
- 59 files · ~29,463 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 236 nodes · 469 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e6c47b99`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Client Details & History|Client Details & History]]
- [[_COMMUNITY_Dashboard Components & Settings|Dashboard Components & Settings]]
- [[_COMMUNITY_Database Sync & Local Storage Context|Database Sync & Local Storage Context]]
- [[_COMMUNITY_Authentication & API Routes|Authentication & API Routes]]
- [[_COMMUNITY_Providers & Global App Layout|Providers & Global App Layout]]
- [[_COMMUNITY_Internationalization & Translation|Internationalization & Translation]]
- [[_COMMUNITY_Admin Analytics Page|Admin Analytics Page]]
- [[_COMMUNITY_Prisma DB Client Singleton|Prisma DB Client Singleton]]
- [[_COMMUNITY_NextAuth TypeScript Definitions|NextAuth TypeScript Definitions]]

## God Nodes (most connected - your core abstractions)
1. `createAdminClient()` - 37 edges
2. `useCurrency()` - 22 edges
3. `useLanguage()` - 18 edges
4. `authOptions` - 14 edges
5. `useClients()` - 8 edges
6. `ClientInvoice()` - 7 edges
7. `QuickPaymentUpdate()` - 6 edges
8. `SerializedClient` - 6 edges
9. `useCreateSubscription()` - 5 edges
10. `formatCurrency()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `createAdminClient()`  [EXTRACTED]
  src/app/api/accounting/reports/route.ts → src/lib/supabase.ts
- `AdminAnalyticsPage()` --calls--> `useCurrency()`  [EXTRACTED]
  src/app/admin/analytics/page.tsx → src/contexts/CurrencyContext.tsx
- `ExpensesPage()` --calls--> `useCurrency()`  [EXTRACTED]
  src/app/admin/expenses/page.tsx → src/contexts/CurrencyContext.tsx
- `GET()` --calls--> `createAdminClient()`  [EXTRACTED]
  src/app/api/accounting/coa/route.ts → src/lib/supabase.ts
- `POST()` --calls--> `createAdminClient()`  [EXTRACTED]
  src/app/api/accounting/coa/route.ts → src/lib/supabase.ts

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 0 - "Client Details & History"
Cohesion: 0.09
Nodes (24): ClientDetailsContent(), getWhatsAppLink(), statusStyles, SUB_STATUS_STYLES, SubscriptionsTab(), Tab, ClientInvoice(), InteractionLog() (+16 more)

### Community 1 - "Dashboard Components & Settings"
Cohesion: 0.07
Nodes (40): AdminDashboardContent(), Client, ClientEditForm(), Client, ClientTable(), FilterPreset, MobileClientCard(), SortMode (+32 more)

### Community 2 - "Database Sync & Local Storage Context"
Cohesion: 0.13
Nodes (15): SyncService(), ClientsContext, ClientsContextType, ClientsProvider(), ClientWithNotes, useClients(), ADMIN_EMAILS, SAMPLE_CLIENTS (+7 more)

### Community 3 - "Authentication & API Routes"
Cohesion: 0.11
Nodes (28): POST(), GET(), POST(), GET(), POST(), POST(), GET(), POST() (+20 more)

### Community 4 - "Providers & Global App Layout"
Cohesion: 0.15
Nodes (8): geistMono, geistSans, metadata, PostHogProvider(), Providers(), CurrencyProvider(), LanguageProvider(), QueryProvider()

### Community 5 - "Internationalization & Translation"
Cohesion: 0.09
Nodes (24): AddExpenseModal(), ExpensesPage(), METHOD_COLORS, METHOD_ICONS, useChartOfAccounts(), useCreateExpense(), useExpenses(), useProducts() (+16 more)

### Community 8 - "Admin Analytics Page"
Cohesion: 0.32
Nodes (4): AdminAnalyticsPage(), Preset, useBalanceSheet(), usePLStatement()

## Knowledge Gaps
- **48 isolated node(s):** `geistSans`, `geistMono`, `metadata`, `Preset`, `statusStyles` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createAdminClient()` connect `Authentication & API Routes` to `Internationalization & Translation`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Why does `useCurrency()` connect `Dashboard Components & Settings` to `Admin Analytics Page`, `Client Details & History`, `Internationalization & Translation`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `useLanguage()` connect `Dashboard Components & Settings` to `Client Details & History`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `geistSans`, `geistMono`, `metadata` to the rest of the system?**
  _48 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Client Details & History` be split into smaller, more focused modules?**
  _Cohesion score 0.09047619047619047 - nodes in this community are weakly interconnected._
- **Should `Dashboard Components & Settings` be split into smaller, more focused modules?**
  _Cohesion score 0.06954887218045112 - nodes in this community are weakly interconnected._
- **Should `Database Sync & Local Storage Context` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._