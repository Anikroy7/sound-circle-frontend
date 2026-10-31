import type { OnboardingStep, PrivacySetting, ToggleOption } from "@/types/account";
import type { SelectOption } from "@/types/common";
import { routes } from "@/lib/routes";

/** The social proof card beside every auth screen. */
export const authHighlight = {
  initials: "NJ",
  tone: "violet",
  title: "Nusrat Jahan joined Neel Akash Collective",
  meta: "Found through Discover · Lead vocals",
} as const;

/** Values the screens are drawn with: a sign-up that hit a duplicate email and a log-in with a wrong password. */
export const signupDraft = { fullName: "Tanvir Ahmed", contact: "tanvir.ahmed@gmail.com", passwordStrength: 3 };
export const loginDraft = { contact: "+880 1712-345678" };

export const onboardingSteps: OnboardingStep[] = [
  { label: "About you", href: routes.onboarding.about },
  { label: "Your music", href: routes.onboarding.music },
  { label: "Collaboration & privacy", href: routes.onboarding.privacy },
];

export const profileDraft = {
  displayName: "Tanvir Ahmed",
  bio: "Lead guitarist from Dhanmondi. Blues and classic rock at heart; I've played with two college bands and now want to start something original.",
  bioLimit: 300,
  yearsPlaying: "8",
  sampleLink: "youtube.com/watch?v=",
  completion: 80,
  area: "Dhanmondi",
};

export const cityOptions: SelectOption[] = [
  { value: "dhaka", label: "Dhaka" },
  { value: "chattogram", label: "Chattogram" },
  { value: "sylhet", label: "Sylhet" },
];

export const areaOptions: SelectOption[] = [
  { value: "dhanmondi", label: "Dhanmondi" },
  { value: "mirpur", label: "Mirpur" },
  { value: "uttara", label: "Uttara" },
];

export const skillOptions: SelectOption[] = [
  { value: "advanced", label: "Advanced" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "professional", label: "Professional" },
];

export const instrumentChoices: ToggleOption[] = [
  { label: "Lead guitar", selected: true },
  { label: "Rhythm guitar", selected: false },
  { label: "Bass", selected: false },
  { label: "Drums", selected: false },
  { label: "Vocals", selected: true },
  { label: "Keyboard", selected: false },
  { label: "Tabla", selected: false },
  { label: "Bansuri", selected: false },
  { label: "Violin", selected: false },
];

export const genreChoices: ToggleOption[] = [
  { label: "Rock", selected: true },
  { label: "Blues", selected: true },
  { label: "Metal", selected: false },
  { label: "Indie", selected: false },
  { label: "Fusion", selected: false },
  { label: "Bangla folk", selected: false },
  { label: "Pop", selected: false },
  { label: "Jazz", selected: false },
];

export const availabilityChoices: ToggleOption[] = [
  { label: "Weekends", selected: true },
  { label: "Weekday evenings", selected: false },
  { label: "Flexible", selected: false },
];

export const openToChoices: ToggleOption[] = [
  { label: "Joining a band", selected: false },
  { label: "Finding members for my band", selected: true },
  { label: "Session work", selected: true },
  { label: "Paid gigs", selected: false },
];

export const privacySettings: PrivacySetting[] = [
  { title: "Who can see my email", hint: "Shared automatically with bands you join", options: ["Bandmates only", "Everyone", "Nobody"] },
  { title: "Who can see my phone", hint: "Recommended: keep it hidden", options: ["Nobody", "Bandmates only"] },
];
