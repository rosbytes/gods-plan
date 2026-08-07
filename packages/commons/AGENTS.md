# Commons Package (`@ros/commons`)

Shared, **pure, stateless** domain utilities consumed by backend APIs. No database access, no environment variables, no side effects.

---

## Commands

```bash
pnpm --filter @ros/commons build       # Build (required before consumers can import)
pnpm --filter @ros/commons typecheck
```

---

## Directory Map

```
packages/commons/
├── tsdown.config.ts            # Bundles src/index.ts → dist/index.mjs
└── src/
    ├── index.ts                # Public re-exports
    ├── hashFunc.ts             # bcrypt password hash/compare
    └── generateOrderCode.ts    # Order code generation
```

---

## Public API

```typescript
import {
    hashAdminPassword,
    compareAdminPassword,
    compareMandiVendorPassword,
    generateOrderCode,
} from "@ros/commons"
```

| Function                     | Used By   | Purpose                               |
| ---------------------------- | --------- | ------------------------------------- |
| `hashAdminPassword`          | admin-api | Hash admin passwords before DB insert |
| `compareAdminPassword`       | admin-api | Verify admin login                    |
| `compareMandiVendorPassword` | mandi-api | Verify vendor login                   |
| `generateOrderCode`          | Both APIs | Generate unique order identifiers     |

---

## Conventions

- **Pure functions only.** No DB imports, no `process.env`, no HTTP calls.
- **Build before use.** This package outputs ESM to `dist/index.mjs`. Consumers depend on the built output.
- **Keep it minimal.** Only add utilities used by 2+ apps. App-specific logic stays in the app.

### Adding a New Utility

1. Create `src/myUtil.ts` with a pure, typed function
2. Re-export from `src/index.ts`
3. Run `pnpm --filter @ros/commons build`
4. Import in consuming apps via `@ros/commons`

---

## Do / Don't

| Do                                | Don't                                    |
| --------------------------------- | ---------------------------------------- |
| Keep functions pure and stateless | Import `@ros/db` or make HTTP calls      |
| Export through `src/index.ts`     | Deep-import from internal paths          |
| Build after changes               | Skip build and wonder why imports fail   |
| Add cross-app shared logic here   | Duplicate helpers inside individual APIs |

---

## Related

- Root guide: [AGENTS.md](../../AGENTS.md)
- Consumers: [admin-api](../../apps/admin-api/AGENTS.md), [mandi-api](../../apps/mandi-api/AGENTS.md)
