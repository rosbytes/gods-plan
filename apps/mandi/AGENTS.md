# Mandi Vendor Portal (`@ros/mandi`)

Mobile-first vendor portal for mandi operations — order collection, slot management, payments, finance, and profile.

**Stack:** React 19 · Vite 8 · Tailwind CSS v4 · React Router v7 · tRPC 11 · TanStack Query · Zustand

**Backend:** [mandi-api](../mandi-api/AGENTS.md) · **API URL env:** `VITE_API_URL`

---

## Commands

```bash
pnpm --filter @ros/mandi dev
pnpm --filter @ros/mandi build
pnpm --filter @ros/mandi typecheck
```

---

## Directory Map

```
apps/mandi/src/
├── main.tsx                    # Root: BrowserRouter, tRPC, TanStack Query
├── App.tsx                     # Route definitions
├── libs/                       # Note: "libs" not "lib"
│   ├── trpc.ts                 # tRPC client (imports AppRouter from mandi-api)
│   ├── customFetch.ts          # Cookie auth + auto token refresh
│   └── utils.ts
├── store/                      # Zustand global state
│   ├── index.ts                # persist middleware, cross-tab sync
│   ├── slices/authSlice.ts
│   ├── slices/uiSlice.ts
│   └── types.ts
├── pages/
│   ├── Home.tsx                # Slot orders, home stats
│   ├── Orders.tsx, Payment.tsx, Finance.tsx
│   ├── Search.tsx, Profile.tsx, Login.tsx
│   └── Transaction.tsx
├── components/
│   ├── layouts/AppLayout.tsx   # Mobile bottom nav + desktop sidebar
│   ├── BottomNavbar.tsx, VendorCard.tsx, SlotTabs.tsx, StatsBar.tsx
│   ├── ProtectedRoute.tsx
│   ├── EmptySlot.tsx
│   ├── ui/                     # Local Button, Input, Avatar, PageHeader
│   └── icons/index.tsx         # Icon exports (migrate to Iconify)
├── data/                       # Static/mock data (being replaced by tRPC)
└── types/index.ts
```

---

## Key Patterns

### Path Alias

This app uses `@/*` → `./src/*`:

```typescript
import { trpc } from "@/libs/trpc"
import AppLayout from "@/components/layouts/AppLayout"
```

Configured in `tsconfig.app.json` and `vite.config.ts`.

### Mobile-First Layout

`AppLayout` provides:

- **Mobile:** Bottom navbar, max-width container (`max-w-107.5`)
- **Desktop:** Sidebar navigation (`md:` breakpoint)

All authenticated pages wrap in `<AppLayout>`. Match mobile designs exactly; adapt for desktop.

### Auth

Same cookie + refresh pattern as admin:

- `customFetch.ts` auto-refreshes on 401
- `ProtectedRoute` calls `trpc.auth.me.useQuery()`

### Zustand State

Persisted to `localStorage` key `mandi-store` with cross-tab sync:

```typescript
// store/index.ts — auth token, UI preferences
import { useStore } from "@/store"
const theme = useStore((s) => s.theme)
```

Use Zustand for client-only state. Use tRPC + TanStack Query for server data.

### Data Fetching

```typescript
// pages/Home.tsx
const { data: stats } = trpc.vendor.getHomeStats.useQuery()
const { data: orders } = trpc.vendor.getSlotOrders.useQuery({ slotId })
```

Prefer tRPC queries over static data in `data/` folder.

### tRPC Client

```typescript
// libs/trpc.ts
import type { AppRouter } from "../../../mandi-api/src/trpc/appRouter"
```

---

## Conventions

| Item       | Convention                                                             |
| ---------- | ---------------------------------------------------------------------- |
| Imports    | `@/*` path alias                                                       |
| Icons      | Iconify — migrate away from inline SVGs in `icons/index.tsx`           |
| Toasts     | Sonner — add `<Toaster />` and use `toast.error()` / `toast.success()` |
| Mobile UX  | Bottom nav, compact cards, touch-friendly targets                      |
| State      | Zustand for UI/auth prefs; TanStack Query for server data              |
| Components | Extract cards, tabs, stats bars into dedicated files                   |

---

## Do / Don't

| Do                                       | Don't                         |
| ---------------------------------------- | ----------------------------- |
| Use `@/*` imports                        | Relative `../../../` paths    |
| Match mobile designs pixel-accurately    | Approximate mobile layouts    |
| Use tRPC for all server data             | Keep relying on `data/` mocks |
| Extract UI into focused components       | Write monolithic page files   |
| Use Iconify for new icons                | Add more inline SVGs          |
| Use Sonner for user feedback             | Silent failures or `alert()`  |
| Prefer `@ros/ui` for new shared controls | Copy Button/Input locally     |

---

## Related

- Backend: [mandi-api/AGENTS.md](../mandi-api/AGENTS.md)
- Shared UI: [packages/ui/AGENTS.md](../../packages/ui/AGENTS.md)
- Design: [DESIGN.md](../../DESIGN.md)
- Root guide: [AGENTS.md](../../AGENTS.md)
