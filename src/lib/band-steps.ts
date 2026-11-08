import { routes } from "@/lib/routes";
import type { BandType } from "@/types/band-api";

/** The three band-creation steps, in order. Limits mirror the API's DTOs, so the form refuses what the API would. */
export const BAND_STEPS = [
  { key: "details", title: "Band information", path: routes.createBandStep.details },
  { key: "members", title: "Members", path: routes.createBandStep.members },
  { key: "media", title: "Performance media", path: routes.createBandStep.media },
] as const;

export type BandStepKey = (typeof BAND_STEPS)[number]["key"];

export const BAND_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  bioMin: 30,
  bioMax: 2000,
  genres: 10,
  /** Owner included. */
  members: 30,
  memberName: 100,
  position: 120,
  photos: 20,
  videos: 10,
  /** The member search starts at this many characters. */
  searchMin: 2,
} as const;

export const BAND_TYPES: { value: BandType; label: string; hint: string }[] = [
  { value: 1, label: "New band", hint: "Just forming: still putting the line-up together." },
  { value: 2, label: "Existing band", hint: "Already playing together." },
];

export const bandTypeLabel = (type: BandType): string => BAND_TYPES.find((option) => option.value === type)?.label ?? "";
