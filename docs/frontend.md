# Frontend Architecture — FC Upgrade Intelligence

> **Status**: Milestone 3A — Foundation ✅  
> **Next**: Milestone 3B — Player Database UI

---

## Overview

Frontend cho **FC Upgrade Intelligence** được xây dựng bằng Next.js 16 với App Router, TypeScript strict mode, Tailwind CSS v4, và các component tự viết tương thích (thay vì shadcn/ui CLI do không tương thích với Tailwind v4).

---

## Technology Stack

| Component        | Technology                    | Version  |
|-----------------|-------------------------------|----------|
| Framework        | Next.js (App Router)          | 16.3.0   |
| Language         | TypeScript (strict)           | ~5.x     |
| Styling          | Tailwind CSS                  | ~4.x     |
| Icons            | Lucide React                  | ~1.31.0  |
| Theme            | next-themes                   | ~0.4.6   |
| UI Primitives    | Radix UI                      | ~1-2.x   |
| Class Utilities  | clsx + tailwind-merge + CVA   | latest   |
| Testing          | Jest + React Testing Library  | ~30.x    |
| Font             | Inter (Google Fonts, Next.js) | —        |

---

## Folder Structure

```
frontend/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (font, theme, header, footer)
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Design system CSS variables
│   ├── error.tsx               # Global error boundary
│   ├── not-found.tsx           # 404 page
│   ├── players/
│   │   ├── page.tsx            # Players foundation
│   │   └── loading.tsx         # Players loading skeleton
│   └── seasons/
│       ├── page.tsx            # Seasons foundation
│       └── loading.tsx         # Seasons loading skeleton
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Navigation header (responsive)
│   │   └── Footer.tsx          # Footer
│   ├── shared/
│   │   ├── PageHeader.tsx      # Page title + description reusable
│   │   ├── EmptyState.tsx      # Empty data state
│   │   ├── ErrorState.tsx      # Error display component
│   │   └── skeletons/
│   │       └── Skeletons.tsx   # TableSkeleton, CardSkeleton, PageSkeleton, PlayerCardSkeleton
│   └── ui/
│       ├── Badge.tsx           # Badge with variants (CVA)
│       ├── Button.tsx          # Button with variants (CVA)
│       └── Card.tsx            # Card components
│
├── lib/
│   ├── api/
│   │   ├── client.ts           # Core HTTP client (fetch + error handling)
│   │   ├── players.ts          # Players API functions
│   │   ├── seasons.ts          # Seasons API functions
│   │   ├── filters.ts          # Filter options API functions
│   │   └── system.ts           # Health + data status API
│   ├── config/
│   │   └── env.ts              # Centralized environment config (no scattered process.env)
│   └── utils/
│       └── cn.ts               # cn() utility + formatters
│
├── providers/
│   └── ThemeProvider.tsx       # next-themes wrapper
│
├── types/
│   └── api/
│       ├── common.ts           # ApiResponse<T>, PaginatedResponse<T>, ApiErrorResponse
│       ├── players.ts          # PlayerListItem, PlayerDetail, PlayerSeasonListItem, etc.
│       ├── seasons.ts          # SeasonListItem, SeasonDetail
│       └── filters.ts          # FilterOption
│
├── __tests__/
│   ├── api/
│   │   └── client.test.ts      # API client utility tests
│   └── components/
│       └── EmptyState.test.tsx # Component render + a11y tests
│
├── .env.example                # Environment variables template
├── jest.config.ts              # Jest configuration
├── jest.setup.ts               # Jest setup (@testing-library/jest-dom)
└── tsconfig.json               # TypeScript strict mode
```

---

## Environment Variables

Copy `.env.example` to `.env.local` before running:

```bash
cp .env.example .env.local
```

| Variable                        | Description                          | Default                        |
|---------------------------------|--------------------------------------|-------------------------------|
| `NEXT_PUBLIC_API_BASE_URL`      | Base URL of the .NET backend API     | `http://localhost:5000`        |
| `NEXT_PUBLIC_APP_URL`           | Public URL of this frontend          | `http://localhost:3000`        |
| `NEXT_PUBLIC_FEATURE_UPGRADE`   | Enable upgrade simulation UI         | `false`                        |
| `NEXT_PUBLIC_FEATURE_PREDICTION`| Enable AI prediction UI              | `false`                        |

> ⚠️ **Security**: Never put secrets in `NEXT_PUBLIC_` variables — they are exposed to the browser.

---

## Development Commands

```bash
# Start development server
npm run dev

# Production build
npm run build

# TypeScript type check
npm run type-check

# Lint
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## API Integration

### Architecture

```
Browser / Next.js RSC
        ↓
lib/api/client.ts   (centralized HTTP client)
        ↓
lib/api/players.ts  lib/api/seasons.ts  lib/api/filters.ts  lib/api/system.ts
        ↓
.NET 10 REST API  (http://localhost:5000/api/v1/)
        ↓
Application Services + EF Core
        ↓
PostgreSQL
```

### ✅ Never:
- `Next.js → PostgreSQL` (direct DB access from frontend)
- `Next.js → FIFAaddict` (direct provider access from browser)
- Hard-coded production URLs in source code

### API Endpoints Used

| Module | Endpoint |
|---|---|
| Players | `GET /api/v1/players` |
| Players | `GET /api/v1/players/{id}` |
| Player Seasons | `GET /api/v1/player-seasons` |
| Player Seasons | `GET /api/v1/player-seasons/{id}` |
| Seasons | `GET /api/v1/seasons` |
| Seasons | `GET /api/v1/seasons/{id}` |
| Filters | `GET /api/v1/filters/positions` |
| Filters | `GET /api/v1/filters/teams` |
| Filters | `GET /api/v1/filters/nations` |
| Filters | `GET /api/v1/filters/leagues` |
| System | `GET /api/v1/system/health` |
| System | `GET /api/v1/data-status` |

---

## Design System

### Color Palette

The design uses CSS variables defined in `app/globals.css`. Dark mode is the default.

| Token | Dark Mode | Description |
|---|---|---|
| `--background` | `hsl(222,47%,6%)` | Page background |
| `--card` | `hsl(222,44%,9%)` | Card surface |
| `--primary` | `hsl(213,94%,60%)` | Electric Blue — CTA, links |
| `--accent` | `hsl(38,92%,55%)` | Amber — OVR highlights |
| `--success` | `hsl(160,84%,39%)` | Emerald — positive states |
| `--destructive` | `hsl(0,86%,60%)` | Red — errors |

Light mode is available via `.light` class.

### Typography

- **Font**: Inter (Google Fonts, Next.js optimized)
- **Subsets**: `latin`, `vietnamese` — ensures correct Vietnamese character rendering
- **Variable**: `--font-inter`

### OVR Color Coding

| OVR Range | Color Class | Usage |
|---|---|---|
| ≥ 99 | `ovr-legendary` (amber) | World class |
| ≥ 95 | `ovr-elite` (purple) | Elite |
| ≥ 90 | `ovr-high` (blue) | High rated |
| ≥ 85 | `ovr-good` (green) | Good |
| ≥ 80 | `ovr-decent` (emerald) | Decent |
| < 80 | `ovr-normal` (muted) | Normal |

---

## Server vs Client Components

| Pattern | When to Use |
|---|---|
| **Server Component** (default) | Data fetching, page layout, static content |
| **`"use client"`** | Interactive state, browser APIs, event handlers |

### Components requiring `"use client"`:
- `Header.tsx` — mobile menu state, usePathname, useTheme
- `ErrorState.tsx` — onRetry callback
- `ThemeProvider.tsx` — next-themes context
- Future: search input, filter dropdowns, upgrade simulator

---

## Theme System

Dark/light mode is implemented via `next-themes` with class strategy:
- Default: `dark` (respects system preference via `enableSystem`)
- Toggle in Header
- Persisted in localStorage
- No hydration mismatch due to `suppressHydrationWarning`

---

## Routes

| Route | Status | Description |
|---|---|---|
| `/` | ✅ Implemented | Homepage with feature grid + data status |
| `/players` | ✅ Foundation | Layout foundation, empty state |
| `/seasons` | ✅ Foundation | Layout foundation, empty state |
| `/upgrade` | 🔜 Milestone 4 | Placeholder |
| `/bait` | 🔜 Milestone 5 | Placeholder |
| `/prediction` | 🔜 Milestone 6 | Placeholder |
| `/statistics` | 🔜 Future | Placeholder |
| `/players/[id]` | 🔜 Milestone 3B | Player detail |
| `/seasons/[id]` | 🔜 Milestone 3B | Season detail |

---

## Testing

- **Framework**: Jest 30 + React Testing Library 16
- **Environment**: jsdom
- **Config**: `jest.config.ts`
- **Setup**: `jest.setup.ts` (imports `@testing-library/jest-dom`)

```bash
npm test                # Run all tests
npm run test:coverage   # With coverage report
```

---

## Milestone 3A Completion Checklist

- [x] Next.js 16 App Router
- [x] TypeScript strict mode
- [x] Tailwind CSS v4
- [x] Lucide React icons
- [x] next-themes dark/light mode
- [x] Inter font (Vietnamese support)
- [x] Design token system (CSS variables)
- [x] Responsive Header + mobile nav
- [x] Footer
- [x] API client with error handling
- [x] TypeScript API types (mirrors C# Contracts)
- [x] Environment config (centralized)
- [x] EmptyState, ErrorState, PageHeader components
- [x] Skeleton loading components
- [x] Badge, Button, Card UI components
- [x] Homepage with DataStatus widget
- [x] `/players` foundation
- [x] `/seasons` foundation
- [x] Global error.tsx boundary
- [x] 404 not-found.tsx
- [x] SEO metadata
- [x] Accessibility (roles, aria, focus states)
- [x] Jest testing foundation
- [x] `docs/frontend.md`

---

## Known Limitations (Milestone 3A)

1. **Player list not implemented** — Milestone 3B
2. **Season list not implemented** — Milestone 3B  
3. **shadcn/ui CLI not used** — Tailwind v4 incompatibility; components manually ported
4. **No authentication** — Future milestone
5. **DataStatus on homepage** — Shows empty state if backend is offline (graceful degradation)
