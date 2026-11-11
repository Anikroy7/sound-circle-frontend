import type { BandMilestone, InstrumentFamily, MusicalInterest } from "@/types/band-api";

/** Each lineup section's name and the `InstrumentIcon` drawing for it; `null` is "Other". */
export const FAMILIES: Record<InstrumentFamily, { label: string; icon: string }> = {
  1: { label: "Vocals", icon: "vocals" },
  2: { label: "Guitar", icon: "guitar" },
  3: { label: "Bass", icon: "bass" },
  4: { label: "Drums", icon: "drums" },
  5: { label: "Keys", icon: "keyboard" },
  6: { label: "Percussion", icon: "tabla" },
  7: { label: "Strings", icon: "violin" },
  8: { label: "Winds", icon: "bansuri" },
  9: { label: "Electronic", icon: "note" },
};

export const familyInfo = (family: InstrumentFamily | null): { label: string; icon: string } =>
  family ? FAMILIES[family] : { label: "Other", icon: "note" };

export const MILESTONES: Record<BandMilestone, { title: string; detail: string }> = {
  1: { title: "First Member Joined", detail: "Someone joined the founder" },
  2: { title: "First 3 Members", detail: "A trio takes shape" },
  3: { title: "Full Band Formation", detail: "A full four-piece" },
  4: { title: "First 5 Members", detail: "Five strong" },
};

export const INTERESTS: { value: MusicalInterest; label: string }[] = [
  { value: 1, label: "Original music" },
  { value: 2, label: "Covers" },
  { value: 3, label: "Songwriting" },
  { value: 4, label: "Live gigs" },
  { value: 5, label: "Recording" },
  { value: 6, label: "Jamming" },
  { value: 7, label: "Touring" },
  { value: 8, label: "Production" },
  { value: 9, label: "Improvisation" },
];

export const interestLabel = (value: MusicalInterest): string => INTERESTS.find((interest) => interest.value === value)?.label ?? "";

export const INTRO_LIMITS = { intro: 500, genres: 5, interests: 5 } as const;

/** "10 Nov 2026". */
export const formatDate = (iso: string): string => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
