import type { Tone } from "@/types/common";

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
