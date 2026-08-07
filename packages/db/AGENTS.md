# Database Package (`@ros/db`)

Shared PostgreSQL schemas, Drizzle ORM client, migrations, seed scripts, and PostGIS geo helpers. Used by `admin-api` and `mandi-api`.

---

## Commands

```bash
docker compose -f packages/db/docker-compose.yml up -d   # Local Postgres
pnpm --filter @ros/db push        # Push schema changes (local dev)
pnpm --filter @ros/db generate     # Generate migration files
pnpm --filter @ros/db migrate      # Apply migrations
pnpm --filter @ros/db seed         # Run seed script
pnpm --filter @ros/db reset        # Reset DB (destructive — ask user first)
pnpm --filter @ros/db typecheck
```

---

## Directory Map

```
packages/db/
├── drizzle-dev.config.ts       # Dev migrations → migrations/local
├── drizzle-prod.config.ts      # Prod migrations → migrations/prod
├── docker-compose.yml
├── seed.ts                     # Database seeding
├── reset-db.ts
└── src/
    ├── index.ts                # Public exports (db, schemas, types, operators, geo)
    ├── db.ts                   # postgres-js + drizzle client (snake_case casing)
    ├── configs/env.config.ts
    ├── common-utils/
    │   ├── columnHelpers.ts    # Reusable columns (timestamps)
    │   └── enums.ts            # TS enum value arrays
    ├── schema/                 # One file per table
    │   ├── admin.ts, city.ts, mandi.ts, mandiVendor.ts, ...
    │   └── enums.ts            # pgEnum declarations (if centralized)
    └── functions/index.ts      # PostGIS helpers (makePoint, distance, withinRadius)
```

---

## Schema Conventions

### Reusable Columns

Define once in `src/common-utils/columnHelpers.ts`, spread into tables:

```typescript
// columnHelpers.ts
export const timestamps = { createdAt: ..., updatedAt: ..., deletedAt: ... }

// schema/mandiVendor.ts
export const mandiVendor = pgTable("mandi_vendor", {
    id: uuid("id").primaryKey().defaultRandom(),
    ...timestamps,
})
```

### Enums

- **TS values** → `src/common-utils/enums.ts` (arrays like `orderStatusValues`)
- **pgEnum instances** → `src/schema/` (so drizzle-kit discovers them)

Enums are schema-level, not table-level. Keep them centralized.

### New Table Checklist

1. Create `src/schema/{tableName}.ts` with `pgTable`, `relations`, and inferred types
2. Export from `src/index.ts`
3. Run `pnpm --filter @ros/db generate`
4. Update `seed.ts` with realistic, hashed data
5. Never hardcode plain-text passwords or static UUIDs in seeds

---

## Public API (`src/index.ts`)

Consumers import via `@ros/db`:

```typescript
import { db, mandiVendor, eq, and, sql } from "@ros/db"
import type { MandiVendor } from "@ros/db"
```

Exports include: `db` client, all table schemas, relations, inferred insert/select types, Drizzle operators (`eq`, `and`, `or`, `sql`, etc.), and geo functions.

---

## Dual Vendor Model

The schema supports two vendor types:

| Table                          | Purpose             |
| ------------------------------ | ------------------- |
| `marketVendor` / `marketStore` | Market-side vendors |
| `mandiVendor` / `mandiStore`   | Mandi-side vendors  |

Know which model your feature targets before writing queries.

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
- **Cutoff Enforcement**: System must reject all new order submissions attempted at or after 11:00 PM.

---

## Do / Don't

| Do                                        | Don't                                     |
| ----------------------------------------- | ----------------------------------------- |
| Spread `...timestamps` from columnHelpers | Duplicate timestamp columns inline        |
| Generate migrations after schema changes  | Modify schema without migrating           |
| Hash passwords with bcrypt in seeds       | Store plain-text passwords in seed data   |
| Use `crypto.randomUUID()` in seeds        | Hardcode static UUID strings              |
| Keep one table per schema file            | Put multiple unrelated tables in one file |
| Ask user before running `reset` or `drop` | Run destructive DB commands silently      |

---

## Related

- Root guide: [AGENTS.md](../../AGENTS.md)
- Used by: [admin-api](../../apps/admin-api/AGENTS.md), [mandi-api](../../apps/mandi-api/AGENTS.md)
- Hashing helpers: [commons](../commons/AGENTS.md)
