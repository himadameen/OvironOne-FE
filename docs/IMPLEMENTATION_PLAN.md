# OVIRON ONE FE — Implementation plan

## Stage 1 — Foundation
- [x] Vite + React + TypeScript + Tailwind
- [x] Path alias `@/`
- [x] Core shadcn primitives (button, input, card, dialog, …)
- [x] `lib/utils`, `lib/format`, `lib/storage`

## Stage 2 — Domain & demo data
- [x] `src/types/domain.ts`
- [x] `src/mocks/seed/initial-state.ts` (Ambur, Toy House, Leather + platform shops)
- [x] `src/stores/demo-store.ts` (persist, sales, stock adjust)
- [x] `src/stores/session-store.ts`

## Stage 3 — Navigation & shells
- [x] `shop-nav.ts` / `platform-nav.ts`
- [x] `ShopLayout` (sidebar, mobile tabs, branch/tenant/role)
- [x] `PlatformLayout`
- [x] `LoginPage` with demo entry points

## Stage 4 — Shop module pages
- [x] Dashboard (KPIs + Recharts)
- [x] POS (cart + checkout + stock)
- [x] Products (table + dialog)
- [x] Full nav catalogue (sales, catalogue, inventory, purchasing, finance, people, admin)
- [x] Extension pages via `RecordWorkspace` pattern
- [x] Mobile searchable “More” module index
- [x] AI Assistant (deterministic chat)

## Stage 5 — Platform module pages
- [x] Platform dashboard, shops list, 7-step create shop wizard
- [x] Subscriptions, users, audit log, settings

## Stage 6 — App wiring
- [x] `routes.tsx` (all nav paths)
- [x] `main.tsx` / `App.tsx` (QueryClient, Router, Toaster)
- [x] Shared components: logo, PageHeader, KPI, EmptyState
- [x] `services/mock/productService.ts`

## Stage 7 — Hardening (next)
- [ ] Auth + API integration (replace demo store)
- [ ] E2E tests (Playwright)
- [ ] i18n / regional languages
- [ ] Print templates (POS / GST invoice)
- [ ] Dark mode toggle
