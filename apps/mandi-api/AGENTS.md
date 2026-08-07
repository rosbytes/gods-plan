# Mandi Vendor API (`@ros/mandi-api`)

Express 5 + tRPC 11 backend for vendor-facing mandi operations. Smaller scope than admin-api — auth and vendor profile/orders/stats only.

**Stack:** Express 5 · tRPC 11 · Zod · Drizzle (`@ros/db`) · AWS S3

**Frontend consumer:** [mandi](../mandi/AGENTS.md)

---

## Commands

```bash
pnpm --filter @ros/mandi-api dev          # tsx watch src/app.ts
pnpm --filter @ros/mandi-api build        # tsdown → dist/app.mjs
pnpm --filter @ros/mandi-api typecheck
```

---

## Directory Map

```
apps/mandi-api/src/
├── app.ts                      # Express entry (note: app.ts, not index.ts)
├── configs/
│   ├── env.ts                  # Zod-validated env
│   ├── logger.ts
│   └── s3.ts                   # AWS S3 config
├── trpc/
│   ├── appRouter.ts            # auth + vendor routers
│   ├── globals.ts              # publicProcedure, vendorProcedure
│   ├── trpc.ts, context.ts, index.ts
├── middlewares/
│   └── mandiVendor.ts          # isVendor middleware
├── modules/                    # Domain modules (plural folder name)
│   ├── auth/                   # auth.route.ts, .controller.ts, .schema.ts, .service.ts
│   └── vendor/                 # vendor.route.ts, .controller.ts, .schema.ts, .service.ts
└── utils/tokens.ts             # Vendor JWT helpers
```

---

## Module Pattern

Same 4-file split as admin-api, but folder is `modules/` (plural):

```
modules/{domain}/
├── {domain}.route.ts       # tRPC router
├── {domain}.controller.ts  # Business logic
├── {domain}.schema.ts      # Zod schemas (Z-prefixed)
└── {domain}.service.ts     # DB queries via @ros/db
```

**Register new routers** in `trpc/appRouter.ts`.

---

## Procedure Tiers

| Procedure         | Auth                | Usage                 |
| ----------------- | ------------------- | --------------------- |
| `publicProcedure` | None                | Login, refresh        |
| `vendorProcedure` | Vendor JWT required | All vendor operations |

Vendor middleware adds `ctx.id` (vendor UUID) after token verification.

---

## Differences from admin-api

| Aspect          | mandi-api                 | admin-api                  |
| --------------- | ------------------------- | -------------------------- |
| Entry file      | `app.ts`                  | `index.ts`                 |
| Module folder   | `modules/` (plural)       | `module/` (singular)       |
| Auth middleware | `mandiVendor.ts`          | `admin.middleware.ts`      |
| JWT env vars    | `JWT_ACCESS_TOKEN_SECRET` | `ADMIN_JWT_*`              |
| Integrations    | S3 only                   | Redis, Razorpay, MSG91, S3 |
| Build tool      | tsdown                    | tsup                       |
| Scope           | auth + vendor             | 10+ domains                |

When copying patterns from admin-api, adjust folder naming and env var prefixes.

---

## Auth & Tokens

- Login sets cookies + headers (same pattern as admin-api)
- Refresh via `auth.refresh` mutation
- JWT secrets: `JWT_ACCESS_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_SECRET`
- Password verification via `@ros/commons` (`compareMandiVendorPassword`)

---

## Environment

Validated in `configs/env.ts`. Key vars: `DATABASE_URL`, `JWT_*`, `AWS_*`

No `REDIS_URL`, no Razorpay, no MSG91 in this API.

Add new vars to both `configs/env.ts` and root `turbo.json` → `globalEnv`.

---

## Business Rules & Core Logic

### 1. Market Store Dispatch Slot Assignment Rules

- **Mandi-Specific Capacity**: Dispatch slots assigned to a `marketStore` are specific to its assigned Mandi (`mandiId`).
- **10 Stores Per Slot Limit**: A single Mandi can have at most **10 active `marketStore` records** assigned to the same slot number.
- **Slot Assignment Algorithm**: When a `marketStore` is created or activated:
    1. Query active `marketStore` records where `mandiId` matches the assigned Mandi.
    2. Evaluate slots in ascending order (Slot 1, Slot 2, ...) and assign the **lowest slot number that currently has fewer than 10 stores**.
    3. If all existing slots are at maximum capacity (10 stores), assign **(highest existing slot + 1)**.

### 2. Market Vendor Order Placement Cutoff Time

- **11:00 PM Cutoff**: Market Vendors can **only place orders before 11:00 PM** (local time).
- **Cutoff Enforcement**: The system must reject all new order submissions attempted at or after 11:00 PM.

---

## Do / Don't

| Do                                           | Don't                                   |
| -------------------------------------------- | --------------------------------------- |
| Follow the 4-file module split in `modules/` | Put queries in controllers              |
| Use `vendorProcedure` for vendor endpoints   | Use `publicProcedure` for protected ops |
| Import DB from `@ros/db`                     | Duplicate schema definitions            |
| Use `@ros/commons` for password checks       | Implement bcrypt inline                 |
| Match admin-api patterns (adapted)           | Copy admin-api env var names            |

---

## Related

- Frontend: [mandi/AGENTS.md](../mandi/AGENTS.md)
- Database: [packages/db/AGENTS.md](../../packages/db/AGENTS.md)
- Utilities: [packages/commons/AGENTS.md](../../packages/commons/AGENTS.md)
- Admin API (reference): [admin-api/AGENTS.md](../admin-api/AGENTS.md)
- Root guide: [AGENTS.md](../../AGENTS.md)
