# Vendor Dashboard (`@ros/vendor`)

Market Vendor frontend portal for ROS operations.

**Stack:** React 19 · Vite 8 · Tailwind CSS v4 · React Router v7 · tRPC 11 · TanStack Query · Sonner

**Backend:** [vendor-api](../vendor-api/AGENTS.md) · **API URL env:** `VITE_API_URL`

---

## Commands

```bash
pnpm --filter @ros/vendor dev
pnpm --filter @ros/vendor build
pnpm --filter @ros/vendor typecheck
```

---

## Directory Map

```
apps/vendor/src/
├── App.tsx                     # Root: tRPC provider, TanStack Query, React Router, Toaster
├── index.css
├── lib/
│   ├── trpc.ts                 # tRPC client (imports AppRouter from vendor-api)
│   └── customFetch.ts          # Cookie auth + auto token refresh on 401
├── pages/                      # Route-level pages
│   ├── Login.tsx
│   └── ...
├── components/                 # Extracted local UI or layout pieces
└── types/                      # Frontend specific domain types
```

---

## Key Patterns

### Routing

Routes are defined in `App.tsx`.

### Auth

- Cookie-based JWT (`accessToken` / `refreshToken`)
- `customFetch.ts` intercepts 401 → calls `POST /trpc/auth.refresh` → retries

### tRPC Client

```typescript
// lib/trpc.ts — imports type directly from vendor-api source
import type { AppRouter } from "../../../vendor-api/src/trpc/appRouter"
```

Uses `httpBatchLink` with `credentials: "include"` and `customFetch`.

---

## Conventions

| Item    | Convention                                                          |
| ------- | ------------------------------------------------------------------- |
| Imports | Relative paths (no `@/*` alias in this app)                         |
| Toasts  | Sonner — `toast.success()`, `toast.error()`                         |
| Icons   | Iconify (`@iconify/react`) — see [DESIGN.md](../../DESIGN.md)       |
| Forms   | Validate with Zod; submit via tRPC mutations                        |
| Types   | Domain types in `types/`; derive API types from tRPC where possible |

---

## Do / Don't

| Do                                           | Don't                          |
| -------------------------------------------- | ------------------------------ |
| Use tRPC mutations/queries for all API calls | Raw fetch to backend endpoints |
| Use Sonner for feedback                      | `alert()` or `confirm()`       |
| Extract page sections into components        | Write 500-line page files      |
| Use `@ros/ui` for new shared components      | Duplicate Button/Input locally |

---

## Related

- Backend: [vendor-api/AGENTS.md](../vendor-api/AGENTS.md)
- Shared UI: [packages/ui/AGENTS.md](../../packages/ui/AGENTS.md)
- Design: [DESIGN.md](../../DESIGN.md)
- Root guide: [AGENTS.md](../../AGENTS.md)
