/**
 * Shapes of the bands API (`/bands/*`). Separate from `types/band.ts`, which describes the demo pages.
 * Numeric enums mirror the backend's.
 */
import type { CatalogItem, MediaItem, ProfileLocation, VideoLink } from "@/types/profile";

/** `BandType`: 1 newly forming · 2 already playing together. */
export type BandType = 1 | 2;

export interface BandMember {
  id: number;
  /** Set for a SoundCircle user; null for a member outside it. */
  user_id: number | null;
  is_owner: boolean;
  name: string;
  /** Their role or instrument in the band. */
  position: string | null;
  photo_url: string | null;
}

/** A band, as its page and the creation wizard read it. Every write answers with this. */
export interface Band {
  id: number;
  /** Null while a draft. */
  slug: string | null;
  name: string;
  bio: string;
  band_type: BandType;
  logo_url: string | null;
  published_at: string | null;
  location: ProfileLocation | null;
  genres: CatalogItem[];
  members: BandMember[];
  photos: MediaItem[];
  videos: VideoLink[];
  /** Whether the signed-in viewer owns it. */
  is_owner: boolean;
}

/** A SoundCircle user the member search found. */
export interface MemberCandidate {
  id: number;
  name: string;
  photo_url: string | null;
  /** "Vocals, Acoustic guitar"; null without a profile. */
  instruments: string | null;
}

/** Creation step 1. */
export interface BandInfoRequest {
  name: string;
  genre_ids: number[];
  location_id: number;
  bio: string;
  band_type: BandType;
}

/** A SoundCircle user (`user_id`), or someone outside it (`name` + `position`, optional photo). */
export type AddMemberRequest = { user_id: number; position?: string } | { name: string; position: string; photo_public_id?: string };
