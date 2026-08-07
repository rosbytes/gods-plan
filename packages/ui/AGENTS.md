# UI Package (`@ros/ui`)

Shared React component library for consistent design across apps. Uses Tailwind CSS v4, Iconify icons, and re-exports Sonner toasts.

---

## Commands

```bash
pnpm --filter @ros/ui dev          # Component playground (Vite, port 5173)
pnpm --filter @ros/ui build        # Build → dist/index.mjs
pnpm --filter @ros/ui typecheck
```

---

## Directory Map

```
packages/ui/
├── dev/                        # Interactive component playground
│   ├── App.tsx                 # Demo all components
│   ├── main.tsx
│   └── index.css
├── src/
│   ├── index.ts                # Public exports (components + toast/Toaster)
│   └── components/
│       ├── Button.tsx          # primary | secondary | outline | danger
│       ├── Input.tsx
│       ├── PhoneInput.tsx      # libphonenumber-js + Iconify
│       └── Spinner.tsx
└── index.html                  # Playground entry
```

---

## Usage in Apps

```typescript
import { Button, Input, PhoneInput, Spinner, toast, Toaster } from "@ros/ui"

// In app root (main.tsx or layout):
<Toaster />

// In components:
<Button variant="primary" isLoading={loading}>Save</Button>
toast.success("Saved successfully")
```

**Peer dependencies:** React 19 and React DOM must be installed in the consuming app.

---

## Component Conventions

- **Props extend native HTML attributes** — `Button` extends `ButtonHTMLAttributes`, `Input` extends `InputHTMLAttributes`.
- **Variants via prop** — Use a `variant` string union, not separate components.
- **Loading states** — `Button` accepts `isLoading` to show spinner and disable interaction.
- **Icons via Iconify** — Use `@iconify/react`. Never inline SVG. See [DESIGN.md](../../DESIGN.md).
- **Brand color** — Primary emerald `#0B4E3E` (matches mandi branding).

### Adding a New Component

1. Create `src/components/MyComponent.tsx`
2. Export from `src/index.ts`
3. Add a demo in `dev/App.tsx` for visual testing
4. Run `pnpm --filter @ros/ui dev` to verify in playground
5. Build before consumers import: `pnpm --filter @ros/ui build`

---

## Adoption Status

| App          | Uses `@ros/ui`?             | Notes                          |
| ------------ | --------------------------- | ------------------------------ |
| `apps/admin` | No (local `components/ui/`) | Migrate when touching UI       |
| `apps/mandi` | No (local `components/ui/`) | Migrate when touching UI       |
| `apps/www`   | No                          | Marketing site, own components |
| `apps/info`  | No                          | Minimal single page            |

**When editing UI in admin or mandi:** Prefer adding to `@ros/ui` and importing, rather than creating another local copy.

---

## Do / Don't

| Do                                        | Don't                                 |
| ----------------------------------------- | ------------------------------------- |
| Use Iconify for icons                     | Inline SVG or custom SVG components   |
| Re-export Sonner from index               | Install Sonner separately in each app |
| Test in dev playground                    | Ship untested components              |
| Extend native HTML props                  | Create overly abstract prop APIs      |
| Use `clsx` + `tailwind-merge` for classes | Hardcode conflicting Tailwind classes |

---

## Related

- Design rules: [DESIGN.md](../../DESIGN.md)
- Root guide: [AGENTS.md](../../AGENTS.md)
