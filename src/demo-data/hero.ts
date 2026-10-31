import type { SelectOption } from "@/types/common";
import type { NowPlaying, SpotlightCard } from "@/types/landing";

export const searchInstruments: SelectOption[] = [
  { value: "drums", label: "Drummer" },
  { value: "lead-guitar", label: "Lead guitarist" },
  { value: "bass", label: "Bassist" },
  { value: "vocals", label: "Vocalist" },
];

export const searchAreas: SelectOption[] = [
  { value: "mirpur-dhaka", label: "Mirpur, Dhaka" },
  { value: "dhanmondi-dhaka", label: "Dhanmondi, Dhaka" },
  { value: "chattogram", label: "Chattogram" },
  { value: "sylhet", label: "Sylhet" },
];

/** The two floating photo cards beside the record, in display order. */
export const spotlightCards: SpotlightCard[] = [
  { name: "Nusrat Jahan", role: "Vocals · Chattogram", initials: "NJ", caption: "Nusrat in studio", tone: "violet" },
  { name: "Rafiq Hossain", role: "Drums · Mirpur", initials: "RH", caption: "Rafiq on drums", tone: "amber" },
];

export const nowPlaying: NowPlaying = {
  title: "Monsoon Groove",
  artist: "Rafiq Hossain · drum sample",
  elapsed: "1:12",
  duration: "2:48",
  progress: 0.43,
};

export const tickerGenres: string[] = [
  "Rock",
  "Bangla Folk",
  "Metal",
  "Baul",
  "Fusion",
  "Indie",
  "Nazrul Sangeet",
  "Blues",
  "Jazz",
  "Hip-hop",
  "Classical",
  "Pop",
];
