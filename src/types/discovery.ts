/**
 * Shapes of discovery and joining: `GET /musicians`, `GET /bands`, `/membership-requests/*`.
 * Numeric enums mirror the backend's.
 */
import type { BandType } from "@/types/band-api";
import type { BandInterest, MusicianProfile } from "@/types/profile";

/** A page of search results. */
export interface SearchPage<T> {
  items: T[];
  meta: { total: number; page: number; page_size: number; total_pages: number };
}

export interface MusicianCard {
  user_id: number;
  slug: string;
  name: string;
  photo_url: string | null;
  bio: string | null;
  band_interest: BandInterest | null;
  /** Best first. */
  instruments: string[];
  genres: string[];
  /** Their widest location, e.g. "Dhaka". */
  location: string | null;
  more_locations: number;
}

/** `GET /musicians/:slug`: anyone's profile. The phone only when public; never the email. */
export interface PublicMusician extends Omit<MusicianProfile, "id" | "slug" | "phone" | "show_phone" | "setup_step" | "is_discoverable"> {
  id: number;
  slug: string;
  user_id: number;
  name: string;
  phone: string | null;
  is_self: boolean;
}

export interface BandCard {
  id: number;
  slug: string;
  name: string;
  logo_url: string | null;
  bio: string;
  band_type: BandType;
  location: string | null;
  genres: string[];
  member_count: number;
  /** Instruments the band is looking for. */
  open_roles: string[];
}

/** A band I'm in (`GET /bands/me`). */
export interface MyBand {
  id: number;
  slug: string | null;
  name: string;
  logo_url: string | null;
  is_owner: boolean;
  is_draft: boolean;
  member_count: number;
  open_role_count: number;
}

/** `MembershipRequestType`: 1 invitation (band → musician) · 2 join request (musician → band). */
export type RequestType = 1 | 2;
/** `MembershipRequestStatus`: 1 pending · 2 accepted · 3 declined · 4 withdrawn · 5 expired. */
export type RequestStatus = 1 | 2 | 3 | 4 | 5;

export interface MembershipRequest {
  id: number;
  type: RequestType;
  status: RequestStatus;
  message: string | null;
  created_at: string;
  responded_at: string | null;
  expires_at: string;
  band: { id: number; name: string; slug: string | null; logo_url: string | null };
  musician: { user_id: number; name: string; slug: string | null; photo_url: string | null };
  role: { open_role_id: number | null; instrument_id: number; name: string } | null;
}

export interface MembershipInbox {
  invitations_received: MembershipRequest[];
  join_requests_received: MembershipRequest[];
  invitations_sent: MembershipRequest[];
  join_requests_sent: MembershipRequest[];
}

export interface OpenRole {
  id: number;
  instrument_id: number;
  instrument_name: string;
  description: string | null;
}

/** One of my published bands, seen from a musician's profile. */
export interface InviteOption {
  band: { id: number; name: string; slug: string; logo_url: string | null };
  /** null = free to invite. */
  status: "member" | "invited" | "requested" | null;
  request: MembershipRequest | null;
  open_roles: OpenRole[];
}

export type RequestAnswer = "accept" | "decline" | "cancel";
