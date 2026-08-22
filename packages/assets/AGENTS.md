# `@ros/assets`

Central repository for shared logos, brand vectors, favicons, and PWA icons across the ROS monorepo.

---

## Structure

- `brand/` — Vector logos and brand graphics (`headerRos.svg`, `ros-black.svg`, etc.)
- `favicons/` — Favicons (`favicon.svg`)
- `icons/` — Master PWA icons (48px to 1024px maskable and standard icons)
- `src/index.ts` — TypeScript exports for asset identifiers and helpers

---

## Usage in Apps

### 1. In Vite Apps (`apps/admin`, `apps/mandi`, `apps/vendor`)

Apps selectively consume static assets from `@ros/assets` using `viteStaticCopy` in `vite.config.ts`, ensuring only required assets are bundled into each app's `dist/`.

### 2. In TypeScript / Component code

```ts
import { ASSET_NAMES } from "@ros/assets"
```
