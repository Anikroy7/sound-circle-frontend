/** The accent palette a piece of demo content is drawn in — see `lib/tones.ts`. */
export type Tone = "teal" | "violet" | "amber" | "blue" | "rose" | "lime" | "slate";

/** Status chip colours. `neutral` is the plain chip; `muted` dims it for expired or inactive states. */
export type ChipTone = "teal" | "violet" | "amber" | "rose" | "muted" | "neutral";

export interface SelectOption {
  value: string;
  label: string;
}

/** A word on a coloured chip, e.g. an invitation's "Pending". Status is never shown by colour alone. */
export interface Status {
  label: string;
  tone: ChipTone;
}

/** Someone shown as an initials avatar until real photos exist. */
export interface PersonRef {
  slug: string;
  name: string;
  initials: string;
  tone: Tone;
}
