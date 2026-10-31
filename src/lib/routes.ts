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
  createBandStep: {
    details: "/bands/new",
    roles: "/bands/new/roles",
    invite: "/bands/new/invite",
    publish: "/bands/new/publish",
  },
  invitations: "/invitations",
  dashboard: "/dashboard",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  onboarding: {
    about: "/onboarding",
    music: "/onboarding/music",
    privacy: "/onboarding/privacy",
    done: "/onboarding/done",
  },
  about: "/about",
  contact: "/contact",
  communityGuidelines: "/community-guidelines",
  privacy: "/privacy",
} as const;
