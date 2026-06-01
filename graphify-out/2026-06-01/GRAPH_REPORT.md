# Graph Report - Dashbord  (2026-06-01)

## Corpus Check
- 46 files · ~20,487 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 157 nodes · 300 edges · 14 communities (12 shown, 2 thin omitted)
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
- [[_COMMUNITY_Prisma DB Client Singleton|Prisma DB Client Singleton]]
- [[_COMMUNITY_NextAuth TypeScript Definitions|NextAuth TypeScript Definitions]]

## God Nodes (most connected - your core abstractions)
1. `useCurrency()` - 18 edges
2. `useLanguage()` - 18 edges
3. `createAdminClient()` - 13 edges
4. `useClients()` - 8 edges
5. `authOptions` - 7 edges
6. `QuickPaymentUpdate()` - 6 edges
7. `SerializedClient` - 6 edges
8. `ClientInvoice()` - 5 edges
9. `formatCurrency()` - 5 edges
10. `Status` - 5 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `createAdminClient()`  [EXTRACTED]
  src/app/api/clients/route.ts → src/lib/supabase.ts
- `POST()` --calls--> `createAdminClient()`  [EXTRACTED]
  src/app/api/clients/route.ts → src/lib/supabase.ts
- `PATCH()` --calls--> `createAdminClient()`  [EXTRACTED]
  src/app/api/clients/[id]/route.ts → src/lib/supabase.ts
- `DELETE()` --calls--> `createAdminClient()`  [EXTRACTED]
  src/app/api/clients/[id]/route.ts → src/lib/supabase.ts
- `POST()` --calls--> `createAdminClient()`  [EXTRACTED]
  src/app/api/clients/[id]/debt/route.ts → src/lib/supabase.ts

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 0 - "Client Details & History"
Cohesion: 0.13
Nodes (18): ClientDetailsContent(), getWhatsAppLink(), statusStyles, Client, ClientEditForm(), ClientInvoice(), InteractionLog(), InteractionLogProps (+10 more)

### Community 1 - "Dashboard Components & Settings"
Cohesion: 0.11
Nodes (24): AdminDashboardContent(), Client, ClientTable(), FilterPreset, MobileClientCard(), SortMode, STATUS_COLORS, CreateClientModal() (+16 more)

### Community 2 - "Database Sync & Local Storage Context"
Cohesion: 0.14
Nodes (16): SyncService(), ClientsContext, ClientsContextType, ClientsProvider(), ClientWithNotes, useClients(), db, OfflineDB (+8 more)

### Community 3 - "Authentication & API Routes"
Cohesion: 0.19
Nodes (13): GET(), POST(), POST(), DELETE(), Params, PATCH(), authOptions, ADMIN_EMAILS (+5 more)

### Community 4 - "Providers & Global App Layout"
Cohesion: 0.11
Nodes (12): geistMono, geistSans, metadata, PostHogProvider(), Providers(), Currency, CurrencyContext, CurrencyContextType (+4 more)

### Community 5 - "Internationalization & Translation"
Cohesion: 0.25
Nodes (7): FAQ_ITEMS, Message, UI_TEXT, LanguageContext, LanguageContextType, Language, translations

## Knowledge Gaps
- **38 isolated node(s):** `geistSans`, `geistMono`, `metadata`, `statusStyles`, `handler` (+33 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useCurrency()` connect `Dashboard Components & Settings` to `Client Details & History`, `Providers & Global App Layout`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `useLanguage()` connect `Dashboard Components & Settings` to `Client Details & History`, `Internationalization & Translation`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `geistSans`, `geistMono`, `metadata` to the rest of the system?**
  _38 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Client Details & History` be split into smaller, more focused modules?**
  _Cohesion score 0.12923076923076923 - nodes in this community are weakly interconnected._
- **Should `Dashboard Components & Settings` be split into smaller, more focused modules?**
  _Cohesion score 0.11363636363636363 - nodes in this community are weakly interconnected._
- **Should `Database Sync & Local Storage Context` be split into smaller, more focused modules?**
  _Cohesion score 0.14461538461538462 - nodes in this community are weakly interconnected._
- **Should `Providers & Global App Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.10822510822510822 - nodes in this community are weakly interconnected._