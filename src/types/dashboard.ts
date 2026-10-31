import type { PersonRef, Status, Tone } from "@/types/common";

export interface CompletionItem {
  label: string;
  done: boolean;
}

export interface DashboardNotification {
  text: string;
  time: string;
  unread: boolean;
}

export interface IncomingInvite {
  band: string;
  monogram: string;
  tone: Tone;
  role: string;
  meta: string;
  expires: string;
}

export interface OutgoingInvite extends PersonRef {
  role: string;
  meta: string;
  status: Status;
  action: string;
}

export interface DashboardBand {
  slug: string;
  name: string;
  monogram: string;
  tone: Tone;
  meta: string;
  badge: Status;
  /** Owned bands show how many roles are filled. */
  roles?: { filled: number; total: number };
}

export interface SuggestedMusician extends PersonRef {
  role: string;
  city: string;
  why: string;
}

export interface Dashboard {
  greeting: string;
  summary: string;
  completion: { percent: number; items: CompletionItem[] };
  views: { total: number; period: string; daily: number[]; insight: string };
  notifications: DashboardNotification[];
  incoming: IncomingInvite[];
  outgoing: OutgoingInvite[];
  ownedBands: DashboardBand[];
  memberBands: DashboardBand[];
  suggestionsFor: string;
  suggestionsLead: string;
  suggested: SuggestedMusician[];
}
