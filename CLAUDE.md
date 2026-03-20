# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EcoGuinée — Environmental Waste Management Dashboard for Guinea. A Next.js 16 App Router app with an API data layer (React Query + axios). French UI. Multiple role-based panels: public, agent, superviseur, admin.

## Commands

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run lint` — run ESLint (flat config, `eslint.config.mjs`)

No test framework is configured.

## Tech Stack

- **Next.js 16** with App Router (`src/app/` directory)
- **React 19**, **TypeScript 5**
- **Tailwind CSS 4** via `@tailwindcss/postcss`
- **UI primitives**: Manual (no shadcn, no CVA, no Radix) — simple variant maps + `cn()`
- **Data fetching**: TanStack React Query v5
- **State management**: Zustand v5 (with `persist` middleware for auth + offline stores)
- **HTTP client**: Axios (interceptors for Bearer token + 401 logout)
- **Forms**: React Hook Form + Zod v4 (`@hookform/resolvers`)
- **Maps**: Leaflet + react-leaflet (loaded via `next/dynamic` with `ssr: false`)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Notifications**: Sonner toasts
- **Fonts**: Syne (display), DM Sans (body), JetBrains Mono (mono) via `next/font/google`

## Path alias

`@/*` resolves to `./src/*` first, then `./` (configured in `tsconfig.json`).

## Architecture

### Routing & Layouts

| Route prefix | Layout | Role |
|---|---|---|
| `/` | PublicNavbar + PublicFooter (inline) | Public landing |
| `/signaler`, `/carte` | PublicNavbar + PublicFooter (inline) | Public standalone |
| `/campagnes` | `src/app/campagnes/layout.tsx` (PublicLayout) | Public campaigns |
| `/agent` | `src/app/agent/layout.tsx` (AgentLayout) | Field agent |
| `/superviseur` | `src/app/superviseur/layout.tsx` (SuperviseurLayout) | Supervisor |
| `/admin` | `src/app/admin/layout.tsx` (AdminLayout) | Admin |

### Directory Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout (fonts, QueryProvider, Toaster)
│   ├── signaler/                 # Citizen report wizard
│   ├── carte/                    # Public full-page map
│   ├── campagnes/                # Public campaign pages (with layout)
│   ├── agent/                    # Agent panel (with layout)
│   ├── superviseur/              # Supervisor panel (with layout)
│   └── admin/                    # Admin panel (with layout)
│
├── lib/
│   ├── types.ts                  # All TypeScript types + metadata maps
│   ├── utils.ts                  # cn(), formatDate(), isActivePath()
│   ├── constants.ts              # Nav configs for all roles
│   ├── query-keys.ts             # TanStack Query key factories
│   ├── use-theme.ts              # Dark mode hook (localStorage)
│   ├── validations/              # Zod schemas
│   │   ├── auth.schema.ts
│   │   ├── report.schema.ts
│   │   ├── campaign.schema.ts
│   │   ├── user.schema.ts
│   │   └── zone.schema.ts
│   └── data/
│       ├── mock-data.ts          # Core mock data (hotspots, users, etc.)
│       ├── campaigns-data.ts     # Campaign mock data
│       └── superviseur-data.ts   # Supervisor-specific mock data
│
├── types/
│   └── index.ts                  # Re-exports from lib/types + API aliases + filter types
│
├── providers/
│   └── query-provider.tsx        # QueryClientProvider + ReactQueryDevtools
│
├── stores/                       # Zustand stores
│   ├── auth.store.ts             # User + token (persists token to localStorage)
│   ├── ui.store.ts               # Sidebar + filters (no persistence)
│   └── offline.store.ts          # Offline report queue (persists queue to localStorage)
│
├── services/                     # Axios-based API calls (no hooks)
│   ├── api.ts                    # Axios instance + interceptors
│   ├── auth.ts
│   ├── reports.ts
│   ├── interventions.ts
│   ├── campaigns.ts
│   ├── zones.ts
│   ├── smes.ts
│   └── users.ts
│
└── hooks/
    ├── queries/                  # useQuery hooks (one file per domain)
    │   ├── useReports.ts
    │   ├── useInterventions.ts
    │   ├── useCampaigns.ts
    │   ├── useZones.ts
    │   ├── useSMEs.ts
    │   └── useUsers.ts
    └── mutations/                # useMutation hooks (one file per action)
        ├── useCreateReport.ts
        ├── useUpdateReport.ts
        ├── useUpdateReportStatus.ts
        ├── useCreateIntervention.ts
        ├── useUpdateIntervention.ts
        ├── useCreateCampaign.ts
        ├── useUpdateCampaign.ts
        └── useSubmitCollecte.ts

components/                       # (at project root, outside src/)
├── ui/                           # Primitives (button, badge, input, etc.)
├── shared/                       # Shared components (KPICard, DataTable, etc.)
├── layouts/                      # Layout components (sidebar-nav, navbar, footer, etc.)
├── maps/                         # Map components (dynamic-map, map-loader)
├── charts/                       # Chart wrappers (bar, area, pie)
├── home/                         # Landing page sections
├── signaler/                     # Report wizard steps
├── carte/                        # Map page components
├── campagnes/                    # Campaign components
├── agent/                        # Agent-specific components
├── superviseur/                  # Supervisor-specific components
└── admin/                        # Admin-specific components
```

### Key Patterns

- **Data layer**: Components call query/mutation hooks → hooks call services → services call axios. No API calls inside components.
- **Query keys**: Centralized in `src/lib/query-keys.ts`. Mutations invalidate relevant keys on success.
- **Zustand stores accessed via hooks only**: Import `useAuthStore`, `useUIStore`, `useOfflineStore` — never import the store object directly in components.
- **Auth**: Token persisted via Zustand `persist` middleware. Axios request interceptor attaches Bearer token. 401 response triggers automatic logout.
- **Offline**: Pending reports queued in `offline.store` (persisted to localStorage), synced when connectivity is restored.
- **Mock data**: Legacy mock files remain in `src/lib/data/` for development/fallback.
- **French UI**: All labels, routes, and data in French.
- **Dates as ISO strings**: Mock data uses string dates for Server Component compatibility.
- **Single SidebarNav**: One reusable `SidebarNav` component with 3 configs (agent/superviseur/admin).
- **Page size rule**: Pages are ~60-80 line composers; logic lives in sub-components.
- **Dark mode**: `.dark` class on `<html>`, persisted via localStorage.
- **Utility**: `cn()` from `src/lib/utils.ts` merges Tailwind classes (clsx + tailwind-merge).
