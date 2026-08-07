# Consumer Website (`@ros/www`)

Marketing and information website for Republic of Sabjiwala — vision, pillars, phases, about, contact, and join-us pages.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · React Hook Form · Zod

**No backend API** — contact form submits via WhatsApp deep link.

---

## Commands

```bash
pnpm --filter @ros/www dev
pnpm --filter @ros/www build
pnpm --filter @ros/www typecheck
pnpm --filter @ros/www lint
```

---

## Directory Map

```
apps/www/src/
├── app/
│   ├── layout.tsx              # Root layout (Header + main)
│   ├── globals.css
│   ├── (root)/
│   │   ├── layout.tsx          # Footer wrapper for home
│   │   └── page.tsx            # Home: VisionCard, QuoteCard, PillarCard, PhaseCard
│   ├── about/page.tsx + layout.tsx
│   ├── contact/page.tsx + layout.tsx
│   └── join-us/page.tsx + layout.tsx
├── components/                 # Header, Footer, PhaseCard, ContactOne, ContactTwo, etc.
├── Schemas/ContactSchema.ts    # Zod schema for contact form
├── constant/index.ts           # socialLinks, WhatsApp phone number
└── utils/cn.ts                 # clsx + tailwind-merge helper
```

---

## Key Patterns

### App Router

- Routes live in `src/app/` following Next.js App Router conventions
- Route groups like `(root)/` share a layout without affecting the URL
- Each section (`about`, `contact`, `join-us`) has its own `page.tsx` and optional `layout.tsx`

### Path Alias

```typescript
import { cn } from "@/utils/cn";
import Header from "@/components/Header";
```

Configured as `@/*` → `./src/*` in `tsconfig.json`.

### Client Components

Interactive pages require `'use client'` at the top:

```typescript
"use client";
// contact/page.tsx — form interactions
```

Server components are the default; only add `'use client'` when needed.

### Forms (React Hook Form + Zod)

Contact form pattern:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactSchema } from "@/Schemas/ContactSchema";

const form = useForm({ resolver: zodResolver(ContactSchema) });
```

Validation schemas live in `src/Schemas/`. Contact submits via WhatsApp (`wa.me`) deep link — no API call.

### Fonts

Multiple custom fonts loaded via `next/font/local` in layouts:

- Apercu, Capcut, Montagu, Roquen

### Static Content

Marketing copy and data live in component-adjacent `*Data.ts` / `*Data.tsx` files or inline in page components.

---

## Conventions

| Item           | Convention                                                |
| -------------- | --------------------------------------------------------- |
| Routing        | App Router file-based (`page.tsx`, `layout.tsx`)          |
| Forms          | React Hook Form + `@hookform/resolvers/zod` + Zod schemas |
| Styling        | Tailwind CSS v4; use `cn()` for conditional classes       |
| Icons          | Iconify preferred — see [DESIGN.md](../../DESIGN.md)      |
| Contact        | WhatsApp deep link, not API submission                    |
| Workspace deps | None — this app is self-contained                         |

---

## Do / Don't

| Do                                  | Don't                                   |
| ----------------------------------- | --------------------------------------- |
| Use App Router conventions          | Mix Pages Router patterns               |
| Validate forms with Zod + RHF       | Manual validation or uncontrolled forms |
| Add `'use client'` only when needed | Mark every file as client component     |
| Keep static content in data files   | Hardcode long copy inside JSX           |
| Use `cn()` for class merging        | Concatenate Tailwind classes manually   |

---

## Related

- Design: [DESIGN.md](../../DESIGN.md)
- Root guide: [AGENTS.md](../../AGENTS.md)
