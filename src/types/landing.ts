import type { ChipTone, Tone } from "@/types/common";

export interface SpotlightCard {
  name: string;
  role: string;
  initials: string;
  caption: string;
  tone: Tone;
}

export interface NowPlaying {
  title: string;
  artist: string;
  elapsed: string;
  duration: string;
  /** Share of the track already played, 0–1. */
  progress: number;
}

export interface Instrument {
  slug: string;
  name: string;
  tone: Tone;
}

export interface FeaturedMusician {
  slug: string;
  name: string;
  instrument: string;
  genres: string[];
  location: string;
  experience: string;
  availability: string;
  initials: string;
  tone: Tone;
  sampleLength: string;
  /** Seeds the decorative waveform so each card draws its own shape. */
  waveSeed: number;
}

export interface HowItWorksStep {
  number: string;
  timecode: string;
  title: string;
  body: string;
}

export interface TrendingBand {
  slug: string;
  name: string;
  monogram: string;
  genre: string;
  city: string;
  description: string;
  status: string;
  statusTone: ChipTone;
  tone: Tone;
  photoCaption: string;
}

export interface RecentMember {
  slug: string;
  name: string;
  role: string;
  city: string;
  initials: string;
  tone: Tone;
}
