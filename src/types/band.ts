import type { PersonRef, Status, Tone } from "@/types/common";

export interface BandMember extends PersonRef {
  role: string;
  isOwner: boolean;
}

export interface Track {
  title: string;
  meta: string;
  length: string;
}

export interface VideoLink {
  title: string;
  tone: Tone;
  /** Shown on the thumbnail, e.g. "YouTube · 5:02". */
  badge?: string;
}

export interface LabelledValue {
  label: string;
  value: string;
}

export interface Show {
  title: string;
  meta: string;
}

export interface BandProfile {
  slug: string;
  name: string;
  monogram: string;
  tone: Tone;
  coverCaption: string;
  status: Status;
  tags: string[];
  about: string;
  members: BandMember[];
  openRole: { role: string; level: string };
  tracks: Track[];
  videos: VideoLink[];
  availability: LabelledValue[];
  openTo: Status[];
  links: LabelledValue[];
  recentShows: Show[];
}

export interface ManagedMember extends BandMember {
  permission: Status;
  joined: string;
}

export interface JoinRequest extends PersonRef {
  role: string;
  note: string;
  when: string;
}

export interface SentInvitation extends PersonRef {
  role: string;
  meta: string;
  status: Status;
  action: string;
}

export interface ManagedBand {
  slug: string;
  name: string;
  monogram: string;
  tone: Tone;
  openRoles: string[];
  members: ManagedMember[];
  joinRequests: JoinRequest[];
  sentInvitations: SentInvitation[];
  details: { genre: string; area: string; status: string; description: string };
}

export interface BandRole {
  role: string;
  /** Label on the preview card, e.g. "Keys" for Keyboard. */
  short: string;
  abbreviation: string;
  status: Status;
  who: string;
}

export interface InviteCandidate extends PersonRef {
  meta: string;
  invited: boolean;
}

export interface BandDraft {
  name: string;
  monogram: string;
  tone: Tone;
  genre: string;
  city: string;
  area: string;
  stage: string;
  description: string;
  roles: BandRole[];
  candidates: InviteCandidate[];
  invitations: SentInvitation[];
  checklist: { label: string; state: "done" | "missing" | "optional" }[];
}
