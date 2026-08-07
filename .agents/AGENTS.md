# Workspace Agent Rules (`@ros` Monorepo)

This file is loaded automatically for agents working in this repository. For full documentation, see the root [AGENTS.md](../AGENTS.md).

---

## Start Here

1. Read [AGENTS.md](../AGENTS.md) for monorepo overview, commands, and modular code rules.
2. Open the **package-specific `AGENTS.md`** for your target area (see navigation table in root file).
3. Follow [DESIGN.md](../DESIGN.md) for UI, icons, and component guidelines.

---

## Non-Negotiable Rules

| Rule               | Detail                                                               |
| ------------------ | -------------------------------------------------------------------- |
| Type safety        | No `any`. Run `pnpm --filter <pkg> typecheck` before finishing.      |
| Package boundaries | DB → `@ros/db`. Pure utils → `@ros/commons`. Shared UI → `@ros/ui`.  |
| Icons              | Iconify only. Never inline SVG.                                      |
| Toasts             | Sonner only. Never `alert()`.                                        |
| DB safety          | Never run destructive scripts without user approval.                 |
| Env vars           | Add to `turbo.json` `globalEnv`. Validate with Zod in API configs.   |
| Modular code       | One responsibility per file. Extract components, types, and helpers. |

---

## Backend Module Split

When adding or modifying API domains:

```
{domain}.route.ts       → tRPC router (procedure wiring)
{domain}.controller.ts  → Business logic handlers
{domain}.schema.ts      → Zod schemas (Z-prefixed)
{domain}.service.ts     → Database queries
```

---

## Where Things Go

| Need                            | Location                      |
| ------------------------------- | ----------------------------- |
| New DB table/column             | `packages/db/src/schema/`     |
| Password hashing, order codes   | `packages/commons/src/`       |
| Reusable Button, Input, Spinner | `packages/ui/src/components/` |
| Admin dashboard page            | `apps/admin/src/pages/`       |
| Vendor portal page              | `apps/mandi/src/pages/`       |
| Admin API endpoint              | `apps/admin-api/src/module/`  |
| Vendor API endpoint             | `apps/mandi-api/src/modules/` |
| Marketing page                  | `apps/www/src/app/`           |
