# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EcoGuinée — Environmental Waste Management Dashboard for Guinea. A Next.js 16 App Router frontend-only app with mock data (no backend). French UI. Multiple role-based panels: public, agent, superviseur, admin.

## Commands

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run lint` — run ESLint (flat config, `eslint.config.mjs`)

No test framework is configured.

## Tech Stack

- **Next.js 16** with App Router (`app/` directory)
- **React 19**, **TypeScript 5**
- **Tailwind CSS 4** via `@tailwindcss/postcss`
- **UI primitives**: Manual (no shadcn, no CVA, no Radix) — simple variant maps + `cn()`
- **Maps**: Leaflet + react-leaflet (loaded via `next/dynamic` with `ssr: false`)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Notifications**: Sonner toasts
- **Fonts**: Syne (display), DM Sans (body), JetBrains Mono (mono) via `next/font/google`

## Path alias

`@/*` maps to the project root (configured in `tsconfig.json`).

## Architecture

### Routing & Layouts

| Route prefix | Layout | Role |
|---|---|---|
| `/` | PublicNavbar + PublicFooter (inline) | Public landing |
| `/signaler`, `/carte` | PublicNavbar + PublicFooter (inline) | Public standalone |
| `/campagnes` | `app/campagnes/layout.tsx` (PublicLayout) | Public campaigns |
| `/agent` | `app/agent/layout.tsx` (AgentLayout) | Field agent |
| `/superviseur` | `app/superviseur/layout.tsx` (SuperviseurLayout) | Supervisor |
| `/admin` | `app/admin/layout.tsx` (AdminLayout) | Admin |

### Directory Structure

```
app/                      # Next.js App Router pages
├── page.tsx              # Landing page
├── layout.tsx            # Root layout (fonts, Toaster)
├── signaler/             # Citizen report wizard
├── carte/                # Public full-page map
├── campagnes/            # Public campaign pages (with layout)
├── agent/                # Agent panel (with layout)
├── superviseur/          # Supervisor panel (with layout)
└── admin/                # Admin panel (with layout)

components/
├── ui/                   # Primitives (button, badge, input, etc.)
├── shared/               # Shared components (KPICard, DataTable, etc.)
├── layouts/              # Layout components (sidebar-nav, navbar, footer, etc.)
├── maps/                 # Map components (dynamic-map, map-loader)
├── charts/               # Chart wrappers (bar, area, pie)
├── home/                 # Landing page sections
├── signaler/             # Report wizard steps
├── carte/                # Map page components
├── campagnes/            # Campaign components
├── agent/                # Agent-specific components
├── superviseur/          # Supervisor-specific components
└── admin/                # Admin-specific components

lib/
├── types.ts              # All TypeScript types + metadata maps
├── utils.ts              # cn(), formatDate(), isActivePath()
├── constants.ts          # Nav configs for all roles
├── use-theme.ts          # Dark mode hook (localStorage)
└── data/
    ├── mock-data.ts      # Core mock data (hotspots, users, etc.)
    ├── campaigns-data.ts # Campaign mock data
    └── superviseur-data.ts # Supervisor-specific mock data
```

### Key Patterns

- **No backend**: All data from static mock files in `lib/data/`. No API calls.
- **French UI**: All labels, routes, and data in French.
- **Dates as ISO strings**: Mock data uses string dates for Server Component compatibility.
- **Single SidebarNav**: One reusable `SidebarNav` component with 3 configs (agent/superviseur/admin).
- **Page size rule**: Pages are ~60-80 line composers; logic lives in sub-components.
- **Dark mode**: `.dark` class on `<html>`, persisted via localStorage.
- **Utility**: `cn()` from `lib/utils.ts` merges Tailwind classes (clsx + tailwind-merge).
