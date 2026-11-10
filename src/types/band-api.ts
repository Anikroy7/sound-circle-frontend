/**
 * Shapes of the bands API (`/bands/*`). Separate from `types/band.ts`, which describes the demo pages.
 * Numeric enums mirror the backend's.
 */
import type { MembershipRequest, OpenRole, RequestType } from "@/types/discovery";
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
  /** What they play, from the catalogue; null when their role names no known instrument. */
  instrument: { id: number; name: string; family: InstrumentFamily | null } | null;
  joined_at: string;
  profile_slug: string | null;
  intro: string | null;
  intro_genres: CatalogItem[];
  interests: MusicalInterest[];
  /** Their membership card number, "SC-0005-00042". */
  card_code: string;
}

/** `InstrumentFamily`: 1 vocals · 2 guitar · 3 bass · 4 drums · 5 keys · 6 percussion · 7 strings · 8 winds · 9 electronic. */
export type InstrumentFamily = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** `MusicalInterest`, 1–9 (see `lib/band-chemistry.ts`). */
export type MusicalInterest = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** `BandMilestone`: 1 first member · 2 three members · 3 full band · 4 five members. */
export type BandMilestone = 1 | 2 | 3 | 4;

/** One section of the lineup; `family` null is "Other". */
export interface LineupSlot {
  family: InstrumentFamily | null;
  count: number;
  /** Open positions wanting it. */
  needed: number;
}

export interface MilestoneProgress {
  milestone: BandMilestone;
  /** Members it takes. */
  members: number;
  /** Null while locked. */
  achieved_at: string | null;
}

/** `GET /bands/:slug/members/:memberId/card`. */
export interface MembershipCard {
  code: string;
  band: { id: number; name: string; slug: string; logo_url: string | null };
  member: { id: number; name: string; photo_url: string | null; instrument: string | null; is_owner: boolean; joined_at: string; profile_slug: string | null };
}

/** `GET /bands/:id/dashboard`: the request queues are filled for the owner only. */
export interface BandDashboard {
  band: Band;
  invitations: MembershipRequest[];
  join_requests: MembershipRequest[];
}

export interface IntroductionRequest {
  intro: string;
  genre_ids: number[];
  interests: MusicalInterest[];
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
  /** Positions the band is looking to fill. */
  open_roles: OpenRole[];
  /** Members per section; the five core sections are always present. */
  lineup: LineupSlot[];
  milestones: MilestoneProgress[];
  /** Whether the signed-in viewer owns it. */
  is_owner: boolean;
  /** Where the signed-in viewer stands with the band. */
  viewer: {
    signed_in: boolean;
    is_member: boolean;
    /** The live invitation (type 1) or join request (type 2) between the viewer and the band. */
    pending_request: { id: number; type: RequestType; instrument_name: string | null } | null;
    /** Open roles whose instrument is on the viewer's profile. */
    fillable_role_ids: number[];
    /** The viewer's own line-up row, when they're in the band. */
    member_id: number | null;
    /** A member who hasn't seen their welcome yet. */
    needs_welcome: boolean;
  };
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
