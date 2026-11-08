import { routes } from "@/lib/routes";
import type { AvailabilitySlot, BandInterest, MusicianProfile, SkillLevel, VideoProvider, Weekday } from "@/types/profile";

/**
 * The eight profile-setup steps, in order. `slug` is the URL (`/onboarding/<slug>`); the number is
 * what the API's `setup_step` counts. Limits mirror the API's DTOs, so the form refuses what the API would.
 */
export const PROFILE_STEPS = [
  { slug: "about", title: "About me", heading: "Tell musicians about yourself", lead: "Your photo, where you're based, and your musical background." },
  { slug: "genres", title: "Music genres", heading: "Your music", lead: "What you play, and what you love listening to." },
  { slug: "instruments", title: "Instruments", heading: "What do you play?", lead: "Pick your instruments and how well you play each." },
  { slug: "contact", title: "Contact", heading: "How can bands reach you?", lead: "Add your phone number and choose who can see it." },
  { slug: "availability", title: "Availability", heading: "When are you free?", lead: "Add the days and times you can usually rehearse or play." },
  { slug: "band-interest", title: "Joining a band", heading: "Looking for a band?", lead: "This helps bands that are recruiting find you." },
  { slug: "gallery", title: "Audio & gallery", heading: "Show your sound", lead: "Audio samples, performance photos and video links. You can add these later too." },
  { slug: "band-experience", title: "Band experience", heading: "Your band experience", lead: "Bands you're in now or have played with before." },
] as const;

export type ProfileStepSlug = (typeof PROFILE_STEPS)[number]["slug"];

export const LIMITS = {
  bioMin: 30,
  bioMax: 1000,
  locations: 20,
  genresPerList: 10,
  instruments: 10,
  availabilitySlots: 21,
  galleryAudio: 10,
  galleryPhotos: 20,
  galleryVideos: 10,
  bands: 10,
  bandPhotos: 10,
  bandVideos: 5,
  fileBytes: 10 * 1024 * 1024,
  bandName: 100,
  bandRole: 120,
} as const;

export const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: 1, label: "Beginner" },
  { value: 2, label: "Intermediate" },
  { value: 3, label: "Advanced" },
  { value: 4, label: "Professional" },
];

/** In the order a Bangladeshi week is read: Saturday first. Values are ISO weekdays. */
export const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
];

export const BAND_INTEREST = { NOT_INTERESTED: 1, OPEN_TO_EXISTING_BAND: 2, NEW_BAND_ONLY: 3 } as const satisfies Record<string, BandInterest>;

/** The band-interest answer as a profile status. */
export const BAND_INTEREST_LABELS: Record<BandInterest, { status: string; detail: string }> = {
  1: { status: "Not looking for a band", detail: "Not looking to join a band right now." },
  2: { status: "Looking for a band", detail: "Open to joining an existing band." },
  3: { status: "Starting a new band", detail: "Would rather start a new band than join one." },
};

export const VIDEO_PROVIDER_NAMES: Record<VideoProvider, string> = { 1: "YouTube", 2: "Vimeo", 3: "Facebook" };

export const stepIndex = (slug: string): number => PROFILE_STEPS.findIndex((step) => step.slug === slug);

/** Where a musician should be sent: the first step they have not done, or the finish page. */
export function profileDestination(profile: Pick<MusicianProfile, "setup_step"> | null): string {
  const done = profile?.setup_step ?? 0;
  return done >= PROFILE_STEPS.length ? routes.onboarding.done : routes.onboarding.step(PROFILE_STEPS[done].slug);
}

/** "4.2 MB", "860 KB". */
export function formatBytes(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** 191 → "3:11". */
export function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;
}

/** "mixkit-hip-hop-02-738.mp3" → "mixkit-hip-hop-02-738": the format is shown separately. */
export const trackTitle = (fileName: string | null): string => fileName?.replace(/\.[a-z0-9]{2,5}$/i, "").trim() || "Audio sample";

/** "16:00" → "4:00 PM". */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
}

/** A saved slot read back: `{ day: "Saturday", time: "4:00 PM – 8:00 PM" }`, or "Any day" / "Anytime". */
export function describeSlot(slot: AvailabilitySlot): { day: string; time: string } {
  const day = WEEKDAYS.find((weekday) => weekday.value === slot.day_of_week)?.label ?? "Any day";
  if (!slot.start_time || !slot.end_time) return { day, time: "Anytime" };
  const overnight = slot.end_time < slot.start_time ? " (next day)" : "";
  return { day, time: `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}${overnight}` };
}

/** Saved slots in week order (Saturday first, "any day" last), so the profile reads like a calendar. */
export function sortSlots(slots: AvailabilitySlot[]): AvailabilitySlot[] {
  const order = (slot: AvailabilitySlot): number => {
    const index = WEEKDAYS.findIndex((weekday) => weekday.value === slot.day_of_week);
    return index === -1 ? WEEKDAYS.length : index;
  };
  return [...slots].sort((a, b) => order(a) - order(b) || (a.start_time ?? "").localeCompare(b.start_time ?? ""));
}
