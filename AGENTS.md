# ROS Monorepo (`gods-plan`) — Agent Guide

Welcome to the **ROS Monorepo (**`gods-plan`**)**. This is the **root entry point** for AI agents. Read this file first, then open the **package-specific** `AGENTS.md` for the area you are working in.

---

## Quick Navigation

| Path               | Package           | Role                                 | Agent Guide                                              |
| ------------------ | ----------------- | ------------------------------------ | -------------------------------------------------------- |
| `apps/admin`       | `@ros/admin`      | Internal admin dashboard (Vite SPA)  | [apps/admin/AGENTS.md](apps/admin/AGENTS.md)             |
| `apps/admin-api`   | `@ros/admin-api`  | Admin backend (Express + tRPC)       | [apps/admin-api/AGENTS.md](apps/admin-api/AGENTS.md)     |
| `apps/mandi`       | `@ros/mandi`      | Vendor portal (Vite SPA)             | [apps/mandi/AGENTS.md](apps/mandi/AGENTS.md)             |
| `apps/mandi-api`   | `@ros/mandi-api`  | Vendor backend (Express + tRPC)      | [apps/mandi-api/AGENTS.md](apps/mandi-api/AGENTS.md)     |
| `apps/vendor`      | `@ros/vendor`     | Market vendor portal (Vite SPA)      | [apps/vendor/AGENTS.md](apps/vendor/AGENTS.md)           |
| `apps/vendor-api`  | `@ros/vendor-api` | Market vendor backend (Express/tRPC) | [apps/vendor-api/AGENTS.md](apps/vendor-api/AGENTS.md)   |
| `apps/www`         | `@ros/www`        | Consumer marketing site (Next.js)    | [apps/www/AGENTS.md](apps/www/AGENTS.md)                 |
| `apps/info`        | `@ros/info`       | Coming-soon microsite (Next.js)      | [apps/info/AGENTS.md](apps/info/AGENTS.md)               |
| `packages/db`      | `@ros/db`         | PostgreSQL schemas & migrations      | [packages/db/AGENTS.md](packages/db/AGENTS.md)           |
| `packages/commons` | `@ros/commons`    | Shared pure utilities                | [packages/commons/AGENTS.md](packages/commons/AGENTS.md) |
| `packages/ui`      | `@ros/ui`         | Shared UI component library          | [packages/ui/AGENTS.md](packages/ui/AGENTS.md)           |

**Design system reference:** [DESIGN.md](DESIGN.md)

---

## Tech Stack

| Layer    | Technologies                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------- |
| Monorepo | pnpm 11.x, Turborepo 2.x, TypeScript                                                            |
| Database | PostgreSQL, Drizzle ORM (`@ros/db`)                                                             |
| Backend  | Node.js, Express 5, tRPC 11, Zod, Redis, Winston, AWS S3                                        |
| Frontend | React 19, Vite 8, Next.js 16, Tailwind CSS v4, TanStack Query, React Router v7, Zustand, Sonner |

---

## Agent Workflow

Follow this order when starting a task:

1. **Identify scope** — Which app or package owns the change? Open its `AGENTS.md`.
2. **Respect boundaries** — Shared logic → `@ros/commons`. Schemas → `@ros/db`. Reusable UI → `@ros/ui`. Do not duplicate across apps.
3. **Match existing patterns** — Read 1–2 similar files in the target area before writing new code (routing, module layout, naming).
4. **Keep changes focused** — One responsibility per file; extract helpers instead of growing monoliths.
5. **Verify** — Run `pnpm --filter <package> typecheck` or `build` before finishing.

---

## Development Commands

```bash
pnpm install                          # Install all dependencies
pnpm dev                              # Run all dev servers (Turbo)
pnpm build                            # Build all packages
pnpm lint                             # Lint all packages

pnpm --filter @ros/<package> dev      # Run one app/package
pnpm --filter @ros/<package> typecheck
pnpm --filter @ros/<package> build
```

### Database (`@ros/db`)

```bash
docker compose -f packages/db/docker-compose.yml up -d   # Start local Postgres
pnpm --filter @ros/db push        # Push schema (local dev)
pnpm --filter @ros/db generate     # Generate migrations
pnpm --filter @ros/db migrate      # Apply migrations
pnpm --filter @ros/db seed         # Seed database
pnpm --filter @ros/db reset        # Reset (destructive — ask user first)
```

---

## Package Boundaries

```
apps/*          → Application-specific UI, routes, and API wiring only
packages/db     → Drizzle schemas, migrations, DB client, geo helpers
packages/commons → Pure, stateless domain helpers (hashing, order codes)
packages/ui     → Reusable React components (Button, Input, Spinner, etc.)
```

**Import rule:** Always use workspace aliases — `@ros/db`, `@ros/commons`, `@ros/ui` — never relative paths across package boundaries.

---

## Modular & Clean Code

These rules apply **everywhere** in the monorepo:

### File & Module Structure

- **One responsibility per file.** A route file wires procedures; a service file queries the DB; a controller handles business logic; a schema file holds Zod types.
- **Break large screens into components.** Extract headers, cards, filters, modals, and forms into dedicated files under `components/`.
- **Extract shared logic early.** Icons → `components/icons/`. Types → `types/`. Constants → `constants/`. Utils → `lib/` or `libs/`.
- **Prefer composition over duplication.** If two apps need the same UI control, add it to `@ros/ui` instead of copying.

### Backend Module Pattern (admin-api, mandi-api)

Each domain lives in its own folder with a consistent split:

```
{domain}/
├── {domain}.route.ts       # tRPC router — wires procedures only
├── {domain}.controller.ts  # Handlers — business logic
├── {domain}.schema.ts      # Zod input/output schemas
└── {domain}.service.ts     # DB queries via @ros/db
```

### Frontend Page Pattern (admin, mandi)

```
pages/MyPage.tsx              # Route-level orchestration (data fetching, layout)
components/MyFeatureCard.tsx  # Focused UI piece
components/icons/index.tsx    # Icon exports (use Iconify — see DESIGN.md)
lib/trpc.ts                   # tRPC client (do not duplicate)
lib/customFetch.ts            # Auth fetch wrapper (do not duplicate)
```

### Naming Conventions

| Item         | Convention                        | Example                               |
| ------------ | --------------------------------- | ------------------------------------- |
| Zod schemas  | `Z` prefix                        | `ZLoginSchema`, `ZCreateVendorSchema` |
| tRPC routers | `{domain}Router`                  | `authRouter`, `vendorRouter`          |
| React pages  | PascalCase file, default export   | `pages/Profile.tsx`                   |
| DB tables    | camelCase in TS, snake_case in DB | `mandiVendor` → `mandi_vendor`        |

---

## Cross-Package Patterns

### tRPC Type Safety (Frontend ↔ Backend)

Frontends import `AppRouter` directly from the backend source (monorepo type sharing):

| Frontend                      | Backend           | Import                                   |
| ----------------------------- | ----------------- | ---------------------------------------- |
| `apps/admin/src/lib/trpc.ts`  | `apps/admin-api`  | `../../../admin-api/src/trpc/appRouter`  |
| `apps/mandi/src/libs/trpc.ts` | `apps/mandi-api`  | `../../../mandi-api/src/trpc/appRouter`  |
| `apps/vendor/src/lib/trpc.ts` | `apps/vendor-api` | `../../../vendor-api/src/trpc/appRouter` |

Both use `httpBatchLink`, `credentials: "include"`, and a shared `customFetch` that auto-refreshes JWT on 401.

### Auth Flow

1. Login mutation → sets `accessToken` / `refreshToken` cookies
2. Protected procedures read cookie or `Authorization: Bearer` header
3. Frontend `customFetch` calls `auth.refresh` on 401 before retrying

### Environment Variables

- Declare new env vars in `turbo.json` → `globalEnv`
- Validate with Zod in each API's `configs/env.ts`
- Never hardcode secrets, JWT tokens, or API keys

---

## Business Rules & Core Logic

### 1. Market Store Dispatch Slot Assignment Rules

- **Mandi-Specific Capacity**: Dispatch slots assigned to a `marketStore` are specific to its assigned Mandi (`mandiId`).
- **10 Stores Per Slot Limit**: A single Mandi can have at most **10 active `marketStore` records** assigned to the same slot number.
- **Slot Assignment Algorithm**: When a `marketStore` is created or activated:
    1. The system queries active `marketStore` records where `mandiId` matches the assigned Mandi.
    2. It evaluates slots in ascending order (Slot 1, Slot 2, ...) and assigns the **lowest slot number that currently has fewer than 10 stores**.
    3. If all existing slots are at maximum capacity (10 stores), the system assigns **(highest existing slot + 1)**.

### 2. Market Vendor Order Placement Cutoff Time

- **11:00 PM Cutoff**: Market Vendors can **only place orders before 11:00 PM** (local time).
- **Cutoff Enforcement**: The system must reject all new order submissions attempted at or after 11:00 PM.

---

## Code Conventions (Global)

1. **TypeScript strictness** — No `any`. Derive types from Zod schemas or Drizzle `$inferSelect` / `$inferInsert`.
2. **Validation** — Zod on all tRPC inputs and form submissions.
3. **Icons** — Iconify only (`@iconify/react`). Never inline SVGs. See [DESIGN.md](DESIGN.md).
4. **Toasts** — Sonner (`toast.success()`, `toast.error()`). Never `alert()`.
5. **Mobile fidelity** — Match mobile designs exactly; adapt fluently for desktop.
6. **Database safety** — Never run destructive DB commands without explicit user approval.

---

## Verification Checklist

Before completing any task:

- [ ] Changes are scoped to the correct package
- [ ] No duplicated logic that belongs in `@ros/commons`, `@ros/db`, or `@ros/ui`
- [ ] Types are strict (no `any`)
- [ ] `pnpm --filter @ros/<package> typecheck` passes
- [ ] New env vars added to `turbo.json` if introduced
- [ ] Schema changes include migration + seed updates
