# Design Pointers & Guidelines (`gods-plan`)

This document outlines the core design pointers, UI/UX guidelines, and iconography standards for all applications in the **ROS Monorepo (`gods-plan`)**.

---

## 1. Iconography Standards (CRITICAL)

- **Strict Iconify Library Usage**: **NEVER** use or generate raw inline `<svg>` code, manual SVG paths, or custom SVG components for icons.
- **Iconify Exclusively**: Always use the **Iconify** library (e.g., `@iconify/react` or `@iconify-icon/react`) for all UI icons across all applications (`apps/admin`, `apps/mandi`, `apps/www`, etc.).
- **Icon Selection**: Choose standard icon sets from Iconify (e.g., `lucide`, `heroicons`, `tabler`, `ph`, `mdi`, `ic`).

---

## 2. Mobile Design Fidelity & Desktop Responsiveness

- **Exact Mobile Screen Fidelity**: When presented with a screenshot or photo of a mobile design, implement the mobile screen layout **exactly as shown in the design/photo**.
- **Fluent Desktop Adaptation**: Ensure mobile-first designs adapt smoothly on desktop viewports (e.g., centered max-width container viewports, multi-column responsive grids, desktop sidebars, and fluid responsive layouts).

---

## 3. Visual Aesthetics & Design System

- **Rich & Premium Aesthetics**: Strive for clean, modern, and visually striking user interfaces with subtle shadows, polished borders, glassmorphism, and refined spacing.
- **Curated Color Palettes**: Avoid generic default colors (plain red, blue, green). Use curated, harmonious color themes (e.g., HSL tailored colors, brand greens/teals like `#0B4E3E` / `#135B47`, dark mode palettes, sleek neutral grays).
- **Modern Typography**: Use consistent, modern typography (e.g., Apercu, Inter, Outfit) with proper font weight hierarchy, clean line heights, and proper letter spacing.

---

## 4. Micro-Interactions & UX Polish

- **Interactive Feedback**: All interactive elements (buttons, cards, links, tabs) must feature smooth hover, active, focus, and disabled states.
- **Loading & Empty States**: Provide appropriate loading spinners/skeletons and empty state illustrations when data is fetching or empty.
- **Smooth Transitions**: Use subtle CSS transitions (`transition-all duration-150 ease-in-out`) for state changes.

---

## 5. Component Modularization & Shared UI Package

- **Clean Component Structure**: Break down large screens into focused, single-responsibility components (e.g., header, navbar, cards, filters, modal forms).
- **Reusable UI Components in `@ros/ui`**: Always add reusable UI components in the `@ros/ui` package (`packages/ui`) and try to use components from `@ros/ui` across applications if appropriate components are available.
- **No Ad-Hoc Duplication**: Extract reusable layout wrappers and UI controls into dedicated files instead of duplicating code across pages.

---

## 6. Notifications & Error Handling

- **Use Sonner Toasts**: Always use **Sonner** (`toast.success()`, `toast.error()`, `toast.info()`) for user notifications, feedback, and error messages.
- **Never Use Native Alerts**: **NEVER** use browser native `alert()`, `confirm()`, or `prompt()` dialogs.
- **Toast-Based Frontend Error Handling**: Handle API errors, validation failures, and mutation exceptions using Sonner toasts for a clean, non-intrusive, and modern user experience.
