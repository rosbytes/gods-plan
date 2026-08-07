# Admin Dashboard (`@ros/admin`)

Internal admin dashboard for ROS operations — vendor onboarding, city/mandi management, vegetable catalog, admin users, and assets.

**Stack:** React 19 · Vite 8 · Tailwind CSS v4 · React Router v7 · tRPC 11 · TanStack Query · Sonner

**Backend:** [admin-api](../admin-api/AGENTS.md) · **API URL env:** `VITE_API_URL`

---

## Commands

```bash
pnpm --filter @ros/admin dev
pnpm --filter @ros/admin build
pnpm --filter @ros/admin typecheck
```

---

## Directory Map

```
apps/admin/src/
├── main.tsx                    # Root: tRPC provider, TanStack Query, Sonner Toaster
├── App.tsx                     # Route definitions (all protected routes wrapped)
├── index.css
├── lib/
│   ├── trpc.ts                 # tRPC client (imports AppRouter from admin-api)
│   ├── customFetch.ts          # Cookie auth + auto token refresh on 401
│   └── upload.ts               # Media upload helper (Express /api/media/upload)
├── pages/                      # Route-level pages
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── ...                     # Vendor onboarding flow pages
├── components/
│   ├── auth/ProtectedRoute.tsx # Session check via trpc.auth.me
│   ├── layout/                 # AdminLayout, Sidebar, TopBar
│   ├── ui/                     # Local UI (Button, Input, Modal, Badge)
│   └── common/Icons.tsx
├── types/                      # api.ts, vendor.ts, mandi.ts, city.ts
├── constants/vendor.ts
└── assets/logo/
```

---

## Key Patterns

### Routing

Routes are defined in `App.tsx`. Protected routes wrap with `<ProtectedRoute>`:

```tsx
<Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

### Auth

- Cookie-based JWT (`accessToken` / `refreshToken`)
- `customFetch.ts` intercepts 401 → calls `POST /trpc/auth.refresh` → retries
- `ProtectedRoute` uses `trpc.auth.me.useQuery()` as session check; redirects to `/login`

### tRPC Client

```typescript
// lib/trpc.ts — imports type directly from admin-api source
import type { AppRouter } from "../../../admin-api/src/trpc/appRouter"
```

Uses `httpBatchLink` with `credentials: "include"` and `customFetch`.

### Vendor Onboarding Flow

Multi-step wizard with dedicated pages per step:

```
/create-vendor → /create-store/:vendorId → /kyc/:vendorId/:storeId
→ /payment/:vendorId/:storeId → ...
```

Each step is its own page file. Keep step logic isolated; share types via `types/vendor.ts`.

### Layout

Pages use `AdminLayout` (collapsible sidebar + top bar). Wrap page content inside this layout component.

---

## Conventions

| Item         | Convention                                                          |
| ------------ | ------------------------------------------------------------------- |
| Imports      | Relative paths (no `@/*` alias in this app)                         |
| Toasts       | Sonner — `toast.success()`, `toast.error()`                         |
| Icons        | Iconify (`@iconify/react`) — see [DESIGN.md](../../DESIGN.md)       |
| Forms        | Validate with Zod; submit via tRPC mutations                        |
| File uploads | Use `lib/upload.ts` → Express `/api/media/upload`                   |
| Types        | Domain types in `types/`; derive API types from tRPC where possible |

---

## Do / Don't

| Do                                           | Don't                          |
| -------------------------------------------- | ------------------------------ |
| Use tRPC mutations/queries for all API calls | Raw fetch to backend endpoints |
| Use Sonner for feedback                      | `alert()` or `confirm()`       |
| Extract page sections into components        | Write 500-line page files      |
| Use `@ros/ui` for new shared components      | Duplicate Button/Input locally |
| Keep onboarding steps as separate pages      | Combine all steps in one file  |

---

## Related

- Backend: [admin-api/AGENTS.md](../admin-api/AGENTS.md)
- Shared UI: [packages/ui/AGENTS.md](../../packages/ui/AGENTS.md)
- Design: [DESIGN.md](../../DESIGN.md)
- Root guide: [AGENTS.md](../../AGENTS.md)
