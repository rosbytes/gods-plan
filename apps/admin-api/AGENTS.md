# Admin API (`@ros/admin-api`)

Express 5 + tRPC 11 backend for admin operations. Largest API in the monorepo — auth, vendor/store onboarding, payments, cities, mandis, vegetables, OTP, admin users, and media uploads.

**Stack:** Express 5 · tRPC 11 · Zod · Drizzle (`@ros/db`) · Redis · Winston · AWS S3 · Razorpay · MSG91

**Frontend consumer:** [admin](../admin/AGENTS.md)

---

## Commands

```bash
pnpm --filter @ros/admin-api dev          # tsx watch src/index.ts
pnpm --filter @ros/admin-api build        # tsup → dist/index.cjs
pnpm --filter @ros/admin-api typecheck
```

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

## Directory Map

```
apps/admin-api/src/
├── index.ts                    # Express app entry
├── configs/
│   ├── env.ts                  # Zod-validated environment variables
│   ├── logger.ts               # Winston logger
│   ├── cache.ts                # Redis client
│   ├── media.ts                # AWS S3 config
│   ├── payment.ts              # Razorpay config
│   └── msg91.ts                # MSG91 SMS/OTP config
├── trpc/
│   ├── appRouter.ts            # Composes all domain routers
│   ├── globals.ts              # publicProcedure, adminProcedure
│   ├── trpc.ts                 # initTRPC + Zod error formatter
│   ├── context.ts              # Request context (req, res)
│   └── index.ts
├── middlewares/
│   └── admin.middleware.ts     # isAdmin (tRPC) + expressIsAdmin (Express)
├── module/                     # Domain modules (singular folder name)
│   ├── auth/                   # auth.route.ts, .controller.ts, .schema.ts, .service.ts
│   ├── vendor/, store/, payment/, city/, mandi/, veg/
│   ├── otp/, adminUser/, asset/
│   └── media/media.router.ts   # Express-only upload route
└── utils/
    ├── tokens.ts               # Admin JWT helpers
    └── rateLimit.ts
```

---

## Module Pattern

Each domain follows a **4-file split**. When adding a new domain, create all four:

```
module/{domain}/
├── {domain}.route.ts       # tRPC router — wires procedures, lazy-imports controller
├── {domain}.controller.ts  # Handler functions — business logic
├── {domain}.schema.ts      # Zod schemas (Z-prefixed: ZLoginSchema)
└── {domain}.service.ts     # Database queries via @ros/db
```

**Register new routers** in `trpc/appRouter.ts`.

### Example: Adding a Procedure

```typescript
// vendor.route.ts
export const vendorRouter = router({
    create: adminProcedure.input(ZCreateVendorSchema).mutation(async ({ input, ctx }) => {
        const { createVendor } = await import("./vendor.controller")
        return createVendor(input, ctx)
    }),
})
```

---

## Procedure Tiers

| Procedure         | Auth         | Usage                            |
| ----------------- | ------------ | -------------------------------- |
| `publicProcedure` | None         | Login, refresh, public endpoints |
| `adminProcedure`  | JWT required | All admin operations             |

Auth reads `accessToken` from cookie or `Authorization: Bearer` header.

---

## Key Integrations

| Service    | Config               | Usage                        |
| ---------- | -------------------- | ---------------------------- |
| PostgreSQL | `@ros/db`            | All data persistence         |
| Redis      | `configs/cache.ts`   | Caching, rate limiting       |
| AWS S3     | `configs/media.ts`   | KYC document uploads         |
| Razorpay   | `configs/payment.ts` | Vendor subscription payments |
| MSG91      | `configs/msg91.ts`   | OTP verification             |

### Express-Only Routes

Some endpoints bypass tRPC and use raw Express:

- `POST /api/media/upload` — multer + S3 (uses `expressIsAdmin` middleware)

Mount tRPC at `/trpc` via `createExpressMiddleware`.

---

## Auth & Tokens

- Login sets `accessToken` / `refreshToken` via `Set-Cookie` + response headers
- Refresh via `auth.refresh` mutation
- JWT secrets: `ADMIN_JWT_ACCESS_TOKEN_SECRET`, `ADMIN_JWT_REFRESH_TOKEN_SECRET`
- Password hashing via `@ros/commons` (`hashAdminPassword`, `compareAdminPassword`)

---

## Environment

All env vars validated in `configs/env.ts` with Zod. App throws on startup if invalid.

Key vars: `DATABASE_URL`, `REDIS_URL`, `ADMIN_JWT_*`, `AWS_*`, `RAZORPAY_*`, `MSG91_*`

Add new vars to both `configs/env.ts` and root `turbo.json` → `globalEnv`.

---

## Deployment

- **Vercel serverless:** `api/index.js` re-exports bundled `dist/index.cjs`
- **Build:** tsup bundles all deps inline (`noExternal: [/.*/]`)

---

## Do / Don't

| Do                                           | Don't                                    |
| -------------------------------------------- | ---------------------------------------- |
| Follow the 4-file module split               | Put DB queries in controllers or routes  |
| Validate all inputs with Zod                 | Accept unvalidated request data          |
| Use `adminProcedure` for protected endpoints | Use `publicProcedure` for admin-only ops |
| Import DB from `@ros/db`                     | Create a separate DB client              |
| Import hashing from `@ros/commons`           | Implement bcrypt inline                  |
| Lazy-import controllers in routes            | Import everything at top level           |

---

## Related

- Frontend: [admin/AGENTS.md](../admin/AGENTS.md)
- Database: [packages/db/AGENTS.md](../../packages/db/AGENTS.md)
- Utilities: [packages/commons/AGENTS.md](../../packages/commons/AGENTS.md)
- Root guide: [AGENTS.md](../../AGENTS.md)
