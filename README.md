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

Every designed screen exists as a static page drawn from `src/demo-data`: landing, `/musicians`, `/musicians/[slug]`, `/bands/[slug]`, `/bands/[slug]/manage`, `/invitations`, `/dashboard`, `/signup`, `/login` and `/onboarding` (three steps + done).

**Auth is wired to the API.** `/signup` (full name, email, password, confirm) calls `POST /users`, signs the new account in and opens profile setup; `/login` (email, password, keep me logged in) calls `POST /auth/login` and opens the dashboard. The tokens are httpOnly cookies, so `src/lib/auth-session.ts` asks `GET /auth/me` once per page load (refreshing once on a 401) and the header shows Log in / Sign up free or Logout from that. **Profile setup is wired to the API.** `/onboarding/<step>` is an eight-step wizard (about — profile photo, location and bio —, genres, instruments, contact, availability, band interest, gallery, band experience; `src/lib/profile-steps.ts`). Each step saves on Continue, so a musician can stop and resume: `/onboarding` and login both send them to their first unfinished step. Audio and photos upload straight from the browser to Cloudinary with a ticket the API signs (`src/lib/cloudinary-upload.ts`); videos are links only. **`/profile` shows the signed-in musician their own profile** (`src/components/profile/my-profile.tsx`, from `GET /auth/me` + `GET /profiles/me`), every section linking back to the step that edits it; the header avatar is the real account's (its photo when there is one) and links there. The profile photo saves as it uploads, from step 1 or straight from the profile page. There is no cover photo anywhere. Everything else is not wired up yet:

- `/musicians/[slug]` and `/bands/[slug]/manage` render their one demo record whatever the slug. `/bands/[slug]` shows the demo band for its demo slug (the header's "Bands" link) and a real band for any other.

**Creating a band is wired to the API.** `/bands/new` → `/members` → `/media` (`src/components/bands/create/`, `src/lib/band-steps.ts`): step 1 (logo, name, genres, practice location, description, band type) saves a draft, members are added from a SoundCircle search or by hand (name, role, photo), performance photos upload and video links save on Publish, which opens the band's page. That page (`src/components/bands/band-page.tsx`) reads `GET /bands/:slug`, and its owner gets **Invite Members**, the same line-up editor in a dialog.
- Buttons, toggles and tabs are inert and forms don't submit; moving between steps uses links.
- Not built: interaction-only states from the design (invite / decline / remove dialogs, toasts, Discover loading, empty and error states), the future Hiring concept, and `/bands` (there is no directory design, so "Bands" in the nav opens the demo band). The footer pages and `/forgot-password` 404.
