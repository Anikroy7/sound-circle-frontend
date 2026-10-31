# SoundCircle frontend

Next.js 16 (App Router, TypeScript, Cache Components) with plain CSS: global tokens and primitives, plus CSS Modules per feature. Yarn, never npm.

```bash
yarn install
yarn dev        # http://localhost:3000
yarn build && yarn start
yarn lint
```

## Layout

```
src/app/                  routes; (auth)/ groups sign up, log in and onboarding under one brand-panel layout
src/components/layout/    site header (capsule nav, guest or signed-in) and the shared page frame
src/components/<feature>/ landing, discover, profile, bands, invitations, dashboard, auth — each with its own CSS module
src/components/ui/        avatar, logo, icons, instrument icons, equalizer, waveform, theme switcher
src/demo-data/            ALL placeholder content — swap each import for an API call later
src/lib/                  routes, tone palette, theme, deterministic waveform generators
src/types/                shapes of the demo data
```

## Theme

System / light / dark, switchable from the header; the default is system. Every colour token in `globals.css` is written once as `light-dark(light, dark)`, and `color-scheme` picks the half: `light dark` follows the OS, while `<html data-theme="light|dark">` forces one. The choice is saved in `localStorage` (`sc-theme`) and applied by an inline `<head>` script before first paint (`src/lib/theme.ts`), so the page stays static and never flashes the wrong theme. New colours go in as tokens, not literals.

## Status

Every designed screen exists as a static page drawn from `src/demo-data`: landing, `/musicians`, `/musicians/[slug]`, `/bands/[slug]`, `/bands/[slug]/manage`, `/bands/new` (four steps), `/invitations`, `/dashboard`, `/signup`, `/login` and `/onboarding` (three steps + done). Nothing is wired up yet:

- Each `[slug]` page renders its one demo record whatever the slug.
- Buttons, toggles and tabs are inert and forms don't submit; moving between steps uses links.
- Not built: interaction-only states from the design (invite / decline / remove dialogs, toasts, Discover loading, empty and error states), the future Hiring concept, and `/bands` (there is no directory design, so "Bands" in the nav opens the demo band). The footer pages and `/forgot-password` 404.
