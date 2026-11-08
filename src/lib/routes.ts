/**
 * Every in-app URL, declared once. The public footer pages (`about`, `contact`, …) and
 * `forgotPassword` have no page yet and 404.
 */
export const routes = {
  home: "/",
  musicians: "/musicians",
  musician: (slug: string): string => `/musicians/${slug}`,
  bands: "/bands",
  band: (slug: string): string => `/bands/${slug}`,
  manageBand: (slug: string): string => `/bands/${slug}/manage`,
  createBand: "/bands/new",
  /** Band creation: information, then members, then performance media and publish (`lib/band-steps.ts`). */
  createBandStep: {
    details: "/bands/new",
    members: "/bands/new/members",
    media: "/bands/new/media",
  },
  invitations: "/invitations",
  dashboard: "/dashboard",
  /** The signed-in musician's own profile, drawn from `/profiles/me`. */
  myProfile: "/profile",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  /** Profile setup: `resume` sends a returning musician to their next step (`lib/profile-steps.ts`). */
  onboarding: {
    resume: "/onboarding",
    step: (slug: string): string => `/onboarding/${slug}`,
    done: "/onboarding/done",
  },
  about: "/about",
  contact: "/contact",
  communityGuidelines: "/community-guidelines",
  privacy: "/privacy",
} as const;
