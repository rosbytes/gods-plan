# Info Microsite (`@ros/info`)

Minimal "Coming Soon" landing page for ROS. Single-page static site with external links (social media, join form).

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS v4

**No backend, no workspace packages, no tRPC.**

---

## Important: Next.js 16

<!-- BEGIN:nextjs-agent-rules -->

This is **not** the Next.js version from training data. Next.js 16 has breaking changes in APIs, conventions, and file structure. Before writing any Next.js code here, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

## Commands

```bash
pnpm --filter @ros/info dev
pnpm --filter @ros/info build
pnpm --filter @ros/info typecheck
```

---

## Directory Map

```
apps/info/src/
├── app/
│   ├── layout.tsx              # Root layout (Poppins + Apercu local fonts)
│   ├── page.tsx                # Single "Coming Soon" landing page
│   ├── globals.css
│   └── fonts/                  # Local font files (apercu_*.otf)
└── public/
    ├── assets/                 # SVG logos, icons
    └── manifest.json
```

---

## Scope

This is the **simplest app** in the monorepo:

- One route: `src/app/page.tsx`
- Black background, mobile-first layout
- External links only (Instagram, LinkedIn, Google Form)
- No forms, no API calls, no shared packages

Changes here should stay minimal. Do not add backend integrations, tRPC, or workspace package dependencies unless explicitly requested.

---

## Conventions

| Item         | Convention                                 |
| ------------ | ------------------------------------------ |
| Routing      | Single App Router page                     |
| Styling      | Tailwind CSS v4 via `@tailwindcss/postcss` |
| Fonts        | `next/font/local` + `next/font/google`     |
| Dependencies | Self-contained — no `@ros/*` imports       |

---

## Do / Don't

| Do                                     | Don't                                    |
| -------------------------------------- | ---------------------------------------- |
| Keep the site minimal and focused      | Add unnecessary features or dependencies |
| Read Next.js 16 docs before coding     | Assume Next.js 14/15 patterns            |
| Match existing black/minimal aesthetic | Over-engineer the single page            |

---

## Related

- Design: [DESIGN.md](../../DESIGN.md)
- Root guide: [AGENTS.md](../../AGENTS.md)
