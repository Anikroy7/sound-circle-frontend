import type { LabelledValue, Track, VideoLink } from "@/types/band";
import type { PersonRef, SelectOption, Status, Tone } from "@/types/common";

export interface MusicianProfile extends PersonRef {
  instruments: string;
  status: Status;
  facts: string[];
  about: string;
  genres: string[];
  /** 1–4, drawn as a four-step meter next to `skillLabel`. */
  skillLevel: number;
  skillLabel: string;
  availability: { when: string; note: string };
  openTo: { label: string; open: boolean }[];
  tracks: (Track & { waveSeed: number; played: number })[];
  videos: VideoLink[];
  photos: { caption: string; tone: Tone }[];
  contact: LabelledValue[];
  contactNote: string;
  pastBands: { name: string; monogram: string; tone: Tone; meta: string }[];
  gigs: { month: string; year: string; event: string; where: string }[];
}

export interface DiscoverResult extends PersonRef {
  instrument: string;
  location: string;
  distance: string;
  genres: string[];
  experience: string;
  available: string;
  preference: Status;
}

export interface DiscoverFilters {
  query: string;
  sortOptions: SelectOption[];
  active: string[];
  instruments: { label: string; checked: boolean }[];
  genres: { label: string; selected: boolean }[];
  areas: SelectOption[];
  experience: { label: string; checked: boolean }[];
  availability: { label: string; checked: boolean }[];
  openTo: { label: string; checked: boolean }[];
  resultCount: number;
  resultScope: string;
}
