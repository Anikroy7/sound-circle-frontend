import type { ChipTone, Tone } from "@/types/common";

/** `tint` is the muted fill behind a photo or icon; `ink` is the accent drawn on top of it. Both are theme-aware CSS variables. */
export const tones: Record<Tone, { tint: string; ink: string }> = {
  teal: { tint: "var(--tone-teal-tint)", ink: "var(--tone-teal-ink)" },
  violet: { tint: "var(--tone-violet-tint)", ink: "var(--tone-violet-ink)" },
  amber: { tint: "var(--tone-amber-tint)", ink: "var(--tone-amber-ink)" },
  blue: { tint: "var(--tone-blue-tint)", ink: "var(--tone-blue-ink)" },
  rose: { tint: "var(--tone-rose-tint)", ink: "var(--tone-rose-ink)" },
  lime: { tint: "var(--tone-lime-tint)", ink: "var(--tone-lime-ink)" },
  slate: { tint: "var(--tone-slate-tint)", ink: "var(--tone-slate-ink)" },
};

const chipClasses: Record<ChipTone, string> = {
  teal: "chip-teal",
  violet: "chip-violet",
  amber: "chip-amber",
  rose: "chip-rose",
  muted: "chip-muted",
  neutral: "",
};

/** The status-chip class for a tone; `neutral` is the plain chip. */
export const chipClass = (tone: ChipTone): string => chipClasses[tone];
