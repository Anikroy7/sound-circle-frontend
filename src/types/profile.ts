import type { LocationLevel, LocationType } from "@/types/location";

/** Shapes of the musician-profile API (`/profiles/me`, `/instruments`, `/genres`). Numeric enums mirror the backend's. */

export interface CatalogItem {
  id: number;
  name: string;
}

/** `SkillLevel`. */
export type SkillLevel = 1 | 2 | 3 | 4;

/** `Weekday`, ISO: 1 Monday … 7 Sunday. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** `BandInterest`: 1 not interested · 2 would join an existing band · 3 would rather start a new one. */
export type BandInterest = 1 | 2 | 3;

/** `MediaType`: 1 image · 3 audio. */
export type MediaType = 1 | 3;

/** `VideoProvider`: 1 YouTube · 2 Vimeo · 3 Facebook. */
export type VideoProvider = 1 | 2 | 3;

export interface MediaItem {
  id: number;
  media_type: MediaType;
  file_name: string | null;
  secure_url: string;
  format: string;
  file_size: number;
  duration_seconds: number | null;
}

export interface VideoLink {
  id: number;
  provider: VideoProvider;
  external_video_id: string;
  url: string;
}

export interface AvailabilitySlot {
  /** Null = any day. */
  day_of_week: Weekday | null;
  /** `HH:MM`; both null = any time. */
  start_time: string | null;
  end_time: string | null;
}

/** One of the musician's locations (`user_locations`): any level of the division → area tree. */
export interface ProfileLocation {
  id: number;
  level: LocationLevel;
  type: LocationType;
  name: string;
  name_bn: string | null;
  /** The place and the places above it, narrowest first: "Mirpur, Dhaka North City Corporation, Dhaka". */
  label: string;
  /** Its division / district / upazila ids, so a wider pick can be seen to cover it. */
  ancestor_ids: number[];
}

export interface BandExperience {
  id: number;
  band_name: string;
  role: string;
  is_current: boolean;
  photos: MediaItem[];
  videos: VideoLink[];
}

/** `GET /profiles/me` — and what every step save answers with. */
export interface MusicianProfile {
  id: number | null;
  slug: string | null;
  /** The last completed step, 0–8. */
  setup_step: number;
  profile_completion: number;
  is_discoverable: boolean;
  /** The profile photo (Cloudinary); null for none. */
  photo_url: string | null;
  bio: string | null;
  /** Where the musician is based or can play, widest first. */
  locations: ProfileLocation[];
  performs_genre_ids: number[];
  listens_genre_ids: number[];
  instruments: { instrument_id: number; skill_level: SkillLevel }[];
  phone: string | null;
  show_phone: boolean;
  availability: AvailabilitySlot[];
  band_interest: BandInterest | null;
  audio: MediaItem[];
  photos: MediaItem[];
  videos: VideoLink[];
  band_experiences: BandExperience[];
}

export interface BandExperienceRequest {
  band_name: string;
  role: string;
  is_current: boolean;
  video_urls: string[];
}

/** Where an upload goes: the gallery, or one band experience's photos. */
export interface MediaTarget {
  media_type: MediaType;
  band_experience_id?: number;
}

/** A signed, single-use Cloudinary upload: POST `fields` plus the file to `upload_url`. */
export interface UploadTicket {
  upload_url: string;
  fields: Record<string, string>;
}
